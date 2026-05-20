import jsPDF from "jspdf";

// ── Constants ────────────────────────────────────────────────
const PW   = 210;   // A4 width  mm
const PH   = 297;   // A4 height mm
const ML   = 15;    // margin left
const MR   = 15;    // margin right
const CW   = PW - ML - MR;  // 180mm content width

// Grayscale palette
const BLACK  = [0,   0,   0  ];
const DARK   = [30,  30,  30 ];
const MID    = [90,  90,  90 ];
const LIGHT  = [160, 160, 160];
const SILVER = [210, 210, 210];
const OFFWHT = [245, 245, 245];
const WHITE  = [255, 255, 255];

// ── Helpers ──────────────────────────────────────────────────
const font = (doc, size, style = "normal", color = DARK) => {
  doc.setFontSize(size);
  doc.setFont("helvetica", style);
  doc.setTextColor(...color);
};

const hline = (doc, y, x1 = ML, x2 = ML + CW, width = 0.3, color = SILVER) => {
  doc.setDrawColor(...color);
  doc.setLineWidth(width);
  doc.line(x1, y, x2, y);
};

const vline = (doc, x, y1, y2, width = 0.3) => {
  doc.setDrawColor(...SILVER);
  doc.setLineWidth(width);
  doc.line(x, y1, x, y2);
};

const rect = (doc, x, y, w, h, fillColor = null, strokeColor = SILVER, lw = 0.3) => {
  doc.setLineWidth(lw);
  if (fillColor) doc.setFillColor(...fillColor);
  doc.setDrawColor(...strokeColor);
  fillColor ? doc.rect(x, y, w, h, "FD") : doc.rect(x, y, w, h, "D");
};

function ensurePage(doc, y, needed, drawFn) {
  if (y + needed > PH - 22) {
    drawFn();
    doc.addPage();
    return 20;
  }
  return y;
}

// ── Image loader ─────────────────────────────────────────────
function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width  = img.naturalWidth;
        c.height = img.naturalHeight;
        c.getContext("2d").drawImage(img, 0, 0);
        resolve({ data: c.toDataURL("image/jpeg", 0.9), w: img.naturalWidth, h: img.naturalHeight });
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// ── Footer ───────────────────────────────────────────────────
function drawFooter(doc, reportId, dateStr, page, total) {
  const y = PH - 14;
  hline(doc, y - 3, ML, ML + CW, 0.5, BLACK);

  font(doc, 7, "normal", MID);
  doc.text("MedAI Diagnostic System  |  AI-Assisted Pathology Report", ML, y + 2);

  font(doc, 7, "normal", MID);
  doc.text(`Report ID: ${reportId}`, ML + CW / 2, y + 2, { align: "center" });

  font(doc, 7, "normal", MID);
  doc.text(`Page ${page} of ${total}  |  ${dateStr}`, ML + CW, y + 2, { align: "right" });
}

// ── Section heading ──────────────────────────────────────────
function sectionHead(doc, title, y) {
  rect(doc, ML, y, CW, 7, OFFWHT, SILVER, 0.3);
  font(doc, 8.5, "bold", DARK);
  doc.text(title, ML + 4, y + 5);
  return y + 7;
}

// ── Main export ──────────────────────────────────────────────
export async function generateReportPDF(result, patientInfo = {}) {
  // Load scan image if available
  let scanImg = null;
  if (result.image_url || result.image_path) {
    const url = result.image_url || result.image_path;
    scanImg = await loadImage(url.startsWith("http") ? url : `http://127.0.0.1:5000/${url}`);
  }

  const doc      = new jsPDF({ unit: "mm", format: "a4" });
  const now      = new Date();
  const dateStr  = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr  = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const reportId = "RPT-" + Math.random().toString(36).slice(2, 9).toUpperCase();

  const name     = patientInfo.name   || "—";
  const age      = patientInfo.age    || "—";
  const gender   = patientInfo.gender || "—";

  const disease    = result.disease    || result.disease_type || "Analysis";
  const prediction = result.result     || "—";
  const confidence = result.confidence != null ? `${result.confidence}%` : "—";
  const riskScore  = result.risk_score ?? result.riskScore;
  const rec        = result.recommendation || "Please consult a qualified physician.";

  const isAbnormal = ["Positive","High Risk","Melanoma Detected","Malignant","Glioma","Meningioma","Pituitary"].includes(prediction);
  const status     = isAbnormal ? "ABNORMAL" : "NORMAL";

  // Observations based on disease
  const observations = {
    "Brain Tumor":    "AI model analyzed MRI scan for intracranial mass lesions. Classification performed across glioma, meningioma, pituitary, and no-tumor categories using convolutional neural network.",
    "Breast Cancer":  "Ultrasound/mammogram image analyzed for malignant or benign tissue patterns. Model evaluated morphological features including mass shape, margin, and echo pattern.",
    "Pneumonia":      "Chest X-ray analyzed for pulmonary consolidation, infiltrates, and opacification patterns indicative of pneumonia. Both lobar and interstitial patterns assessed.",
    "Skin Cancer":    "Dermoscopic image analyzed for melanoma indicators including asymmetry, border irregularity, color variation, and diameter. ABCD criteria applied by model.",
    "Heart Disease":  "Clinical parameters analyzed using ensemble ML model (Random Forest + XGBoost). Cardiovascular risk stratification performed based on provided vitals and history.",
  };
  const observation = observations[disease] || "Medical image/data analyzed by AI diagnostic model. Results reflect model prediction based on provided input.";

  // ── PAGE 1 ───────────────────────────────────────────────────────────────────
  let y = 0;

  // Outer border
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.6);
  doc.rect(8, 8, PW - 16, PH - 16);

  // ── HEADER ──────────────────────────────────────────────────────────────────
  // Top black bar
  doc.setFillColor(...BLACK);
  doc.rect(8, 8, PW - 16, 18, "F");

  font(doc, 14, "bold", WHITE);
  doc.text("MedAI DIAGNOSTIC CENTER", PW / 2, 20, { align: "center" });

  // Sub-header strip
  doc.setFillColor(...OFFWHT);
  doc.rect(8, 26, PW - 16, 8, "F");
  hline(doc, 26, 8, PW - 8, 0.4, BLACK);
  hline(doc, 34, 8, PW - 8, 0.4, BLACK);

  font(doc, 8, "normal", MID);
  doc.text("AI-Assisted Pathology & Diagnostic Report", PW / 2, 31.5, { align: "center" });

  y = 42;

  // ── REPORT INFO BAR ──────────────────────────────────────────────────────────
  font(doc, 7.5, "normal", MID);
  doc.text(`Report ID: ${reportId}`, ML, y);
  doc.text(`Date: ${dateStr}   Time: ${timeStr}`, ML + CW, y, { align: "right" });
  doc.text(`Department: AI Diagnostics`, PW / 2, y, { align: "center" });

  y += 5;
  hline(doc, y, ML, ML + CW, 0.4, BLACK);
  y += 6;

  // ── PATIENT DETAILS ──────────────────────────────────────────────────────────
  y = sectionHead(doc, "PATIENT INFORMATION", y);
  y += 2;

  // 2-column table
  const col1 = ML;
  const col2 = ML + CW / 2;
  const rowH = 8;

  const patientRows = [
    [["Patient Name", name],       ["Report ID",   reportId]],
    [["Age",          age],        ["Date",        dateStr]],
    [["Gender",       gender],     ["Time",        timeStr]],
    [["Referred By",  "AI System"],["Department",  "Diagnostic Imaging"]],
  ];

  // Table border
  rect(doc, ML, y, CW, rowH * patientRows.length, null, SILVER, 0.3);

  patientRows.forEach((row, i) => {
    const ry = y + i * rowH;
    if (i > 0) hline(doc, ry, ML, ML + CW, 0.2, SILVER);
    vline(doc, col2, ry, ry + rowH);

    // Left cell
    font(doc, 7.5, "normal", LIGHT);
    doc.text(row[0][0], col1 + 3, ry + 3.5);
    font(doc, 8, "bold", DARK);
    doc.text(String(row[0][1]), col1 + 3, ry + 7);

    // Right cell
    font(doc, 7.5, "normal", LIGHT);
    doc.text(row[1][0], col2 + 3, ry + 3.5);
    font(doc, 8, "bold", DARK);
    doc.text(String(row[1][1]), col2 + 3, ry + 7);
  });

  y += rowH * patientRows.length + 8;

  // ── DETECTION SUMMARY TABLE ──────────────────────────────────────────────────
  y = sectionHead(doc, "DISEASE DETECTION SUMMARY", y);
  y += 2;

  // Table header
  const cols = [55, 45, 45, 35];  // widths
  const colX = [ML, ML + 55, ML + 100, ML + 145];
  const headers = ["Disease / Test", "Prediction Result", "Confidence Score", "Status"];

  rect(doc, ML, y, CW, 8, DARK, BLACK, 0.4);
  headers.forEach((h, i) => {
    font(doc, 8, "bold", WHITE);
    doc.text(h, colX[i] + 3, y + 5.5);
    if (i > 0) {
      doc.setDrawColor(...MID);
      doc.setLineWidth(0.2);
      doc.line(colX[i], y, colX[i], y + 8);
    }
  });
  y += 8;

  // Data row
  rect(doc, ML, y, CW, 10, WHITE, SILVER, 0.3);
  const rowData = [disease, prediction, confidence, status];
  rowData.forEach((val, i) => {
    if (i > 0) vline(doc, colX[i], y, y + 10);
    const isBold = i === 3;
    font(doc, 8.5, isBold ? "bold" : "normal", i === 3 ? (isAbnormal ? [60, 60, 60] : DARK) : DARK);
    doc.text(String(val), colX[i] + 3, y + 6.5);
  });
  y += 10;

  // Risk score row (if available)
  if (riskScore != null) {
    rect(doc, ML, y, CW, 10, OFFWHT, SILVER, 0.3);
    font(doc, 8, "normal", MID);
    doc.text("Risk Score", colX[0] + 3, y + 6.5);
    vline(doc, colX[1], y, y + 10);
    font(doc, 8.5, "bold", DARK);
    doc.text(`${riskScore} / 100`, colX[1] + 3, y + 6.5);
    vline(doc, colX[2], y, y + 10);
    font(doc, 8, "normal", MID);
    doc.text(riskScore > 50 ? "Elevated" : "Within Range", colX[2] + 3, y + 6.5);
    vline(doc, colX[3], y, y + 10);
    font(doc, 8.5, "bold", DARK);
    doc.text(riskScore > 50 ? "HIGH" : "LOW", colX[3] + 3, y + 6.5);
    y += 10;
  }

  // Bottom border of table
  hline(doc, y, ML, ML + CW, 0.4, BLACK);
  y += 8;

  // ── SCAN IMAGE ───────────────────────────────────────────────────────────────
  y = ensurePage(doc, y, 80, () => drawFooter(doc, reportId, dateStr, 1, 2));
  y = sectionHead(doc, "SCAN / IMAGE PREVIEW", y);
  y += 2;

  if (scanImg) {
    const maxW  = CW;
    const maxH  = 65;
    const ratio = scanImg.w / scanImg.h;
    let iw = maxW, ih = maxW / ratio;
    if (ih > maxH) { ih = maxH; iw = maxH * ratio; }
    const ix = ML + (CW - iw) / 2;

    rect(doc, ML, y, CW, ih + 4, WHITE, SILVER, 0.3);
    doc.addImage(scanImg.data, "JPEG", ix, y + 2, iw, ih);
    y += ih + 8;
  } else {
    rect(doc, ML, y, CW, 14, OFFWHT, SILVER, 0.3);
    font(doc, 8, "italic", LIGHT);
    doc.text("No scan image provided for this report.", PW / 2, y + 9, { align: "center" });
    y += 18;
  }

  // ── OBSERVATION ──────────────────────────────────────────────────────────────
  y = ensurePage(doc, y, 40, () => drawFooter(doc, reportId, dateStr, 1, 2));
  y = sectionHead(doc, "OBSERVATION", y);
  y += 3;

  const obsLines = doc.splitTextToSize(observation, CW - 8);
  const obsH     = obsLines.length * 5 + 6;
  rect(doc, ML, y, CW, obsH, WHITE, SILVER, 0.3);
  font(doc, 8.5, "normal", DARK);
  doc.text(obsLines, ML + 4, y + 5);
  y += obsH + 8;

  // ── RECOMMENDATION ───────────────────────────────────────────────────────────
  y = ensurePage(doc, y, 40, () => drawFooter(doc, reportId, dateStr, 1, 2));
  y = sectionHead(doc, "RECOMMENDATION", y);
  y += 3;

  const recLines = doc.splitTextToSize(rec, CW - 8);
  const recH     = recLines.length * 5 + 6;
  rect(doc, ML, y, CW, recH, WHITE, SILVER, 0.3);
  font(doc, 8.5, "normal", DARK);
  doc.text(recLines, ML + 4, y + 5);
  y += recH + 8;

  // ── AI ANALYSIS NOTE ─────────────────────────────────────────────────────────
  y = ensurePage(doc, y, 40, () => drawFooter(doc, reportId, dateStr, 1, 2));
  y = sectionHead(doc, "AI ANALYSIS NOTE", y);
  y += 3;

  const aiNote = `This report was generated using MedAI's deep learning diagnostic model trained on validated medical datasets. The ${disease} analysis was performed using a convolutional neural network (CNN) architecture. The model output reflects a statistical prediction and carries an inherent margin of error. All findings must be correlated clinically and confirmed by a licensed medical professional before any treatment decision is made.`;
  const aiLines = doc.splitTextToSize(aiNote, CW - 8);
  const aiH     = aiLines.length * 5 + 6;
  rect(doc, ML, y, CW, aiH, OFFWHT, SILVER, 0.3);
  font(doc, 8.5, "normal", DARK);
  doc.text(aiLines, ML + 4, y + 5);
  y += aiH + 8;

  // ── SIGNATURE BLOCK ──────────────────────────────────────────────────────────
  y = ensurePage(doc, y, 30, () => drawFooter(doc, reportId, dateStr, 1, 2));
  hline(doc, y, ML, ML + CW, 0.4, BLACK);
  y += 6;

  // Two signature boxes
  const sigW = (CW - 10) / 2;
  rect(doc, ML, y, sigW, 22, WHITE, SILVER, 0.3);
  rect(doc, ML + sigW + 10, y, sigW, 22, WHITE, SILVER, 0.3);

  font(doc, 7.5, "normal", MID);
  doc.text("Analyzed By", ML + 4, y + 5);
  font(doc, 8.5, "bold", DARK);
  doc.text("MedAI Diagnostic Engine v2.0", ML + 4, y + 11);
  font(doc, 7.5, "normal", MID);
  doc.text("AI-Assisted Analysis System", ML + 4, y + 17);

  font(doc, 7.5, "normal", MID);
  doc.text("Verified By", ML + sigW + 14, y + 5);
  font(doc, 8.5, "bold", DARK);
  doc.text("Authorized Physician", ML + sigW + 14, y + 11);
  hline(doc, y + 18, ML + sigW + 14, ML + sigW + 14 + sigW - 8, 0.4, DARK);
  font(doc, 7.5, "italic", LIGHT);
  doc.text("Signature", ML + sigW + 14 + (sigW - 8) / 2, y + 21, { align: "center" });

  y += 28;

  // ── DISCLAIMER ───────────────────────────────────────────────────────────────
  hline(doc, y, ML, ML + CW, 0.4, BLACK);
  y += 4;

  const disclaimer = "DISCLAIMER: This AI-generated report is intended for preliminary analysis only and should not replace professional medical diagnosis. The results are based on algorithmic interpretation and may not account for all clinical variables. Always consult a qualified healthcare professional for diagnosis and treatment.";
  const dLines = doc.splitTextToSize(disclaimer, CW);
  font(doc, 7, "italic", MID);
  doc.text(dLines, PW / 2, y + 4, { align: "center" });

  // ── FOOTER on all pages ───────────────────────────────────────────────────────
  const total = doc.internal.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    // Re-draw outer border on each page
    doc.setDrawColor(...BLACK);
    doc.setLineWidth(0.6);
    doc.rect(8, 8, PW - 16, PH - 16);
    drawFooter(doc, reportId, dateStr, p, total);
  }

  doc.save(`MedAI_Report_${reportId}.pdf`);
}
