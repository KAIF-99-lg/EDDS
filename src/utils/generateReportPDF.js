import jsPDF from "jspdf";

const PW = 210, PH = 297, ML = 15, CW = 180;

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        c.getContext("2d").drawImage(img, 0, 0);
        resolve({ data: c.toDataURL("image/jpeg", 0.9), w: img.naturalWidth, h: img.naturalHeight });
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function generateReportPDF(result, patientInfo = {}) {
  const disease    = result.disease || result.report_type || result.disease_type || "Analysis";
  const prediction = result.result  || "—";
  const confidence = result.confidence != null ? `${result.confidence}%` : null;
  const riskScore  = result.risk_score ?? result.riskScore ?? null;
  const rec        = result.recommendation || "Please consult a qualified physician.";
  const name       = patientInfo.name   || result.user_name  || "—";
  const age        = patientInfo.age    || result.user_age   || "—";
  const gender     = patientInfo.gender || result.user_gender|| "—";

  const isHeart    = disease === "Heart Disease";
  const isGood     = ["Negative","Low Risk","Benign","Normal","No Tumor"].some(x => prediction.includes(x));

  // Load image only for non-heart
  let scanImg = null;
  if (!isHeart && (result.image_path || result.image_url)) {
    const url = result.image_path || result.image_url;
    const fullUrl = url.startsWith("http") ? url : `http://127.0.0.1:5000/${url}`;
    scanImg = await loadImage(fullUrl);
  }

  const doc     = new jsPDF({ unit: "mm", format: "a4" });
  const now     = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const reportId = "RPT-" + Math.random().toString(36).slice(2, 8).toUpperCase();

  let y = 15;

  // ── HEADER ──
  doc.setFillColor(30, 30, 30);
  doc.rect(ML, y, CW, 14, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("MedAI — Medical Report", PW / 2, y + 9, { align: "center" });
  y += 18;

  // ── DATE + REPORT ID ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`Date: ${dateStr}   |   Report ID: ${reportId}`, PW / 2, y, { align: "center" });
  y += 8;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(ML, y, ML + CW, y);
  y += 6;

  // ── PATIENT INFO ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text("Patient Information", ML, y);
  y += 5;

  doc.setFillColor(248, 248, 248);
  doc.rect(ML, y, CW, 18, "F");
  doc.setDrawColor(220, 220, 220);
  doc.rect(ML, y, CW, 18, "D");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Name:`, ML + 4, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(String(name), ML + 22, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(`Age:`, ML + 4, y + 13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(String(age), ML + 22, y + 13);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(`Gender:`, ML + 70, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(String(gender), ML + 90, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(`Test:`, ML + 70, y + 13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(disease, ML + 90, y + 13);

  y += 24;

  // ── RESULT ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text("Result", ML, y);
  y += 5;

  const resultBg = isGood ? [240, 253, 244] : [254, 242, 242];
  const resultBorder = isGood ? [134, 239, 172] : [252, 165, 165];
  const resultColor  = isGood ? [22, 101, 52]  : [153, 27, 27];

  doc.setFillColor(...resultBg);
  doc.setDrawColor(...resultBorder);
  doc.rect(ML, y, CW, 16, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...resultColor);
  doc.text(prediction, PW / 2, y + 10, { align: "center" });
  y += 22;

  // ── CONFIDENCE / RISK ──
  if (confidence || riskScore != null) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    if (confidence) doc.text(`Confidence: ${confidence}`, ML, y);
    if (riskScore != null) doc.text(`Risk Score: ${riskScore}/100`, ML + 60, y);
    y += 10;
  }

  // ── RECOMMENDATION ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text("What this means", ML, y);
  y += 5;

  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  const recLines = doc.splitTextToSize(rec, CW - 8);
  const recH = recLines.length * 5 + 8;
  doc.rect(ML, y, CW, recH, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(30, 58, 138);
  doc.text(recLines, ML + 4, y + 6);
  y += recH + 10;

  // ── SCAN IMAGE (non-heart only) ──
  if (scanImg) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text("Scan Image", ML, y);
    y += 5;

    const maxW = CW, maxH = 90;
    const ratio = scanImg.w / scanImg.h;
    let iw = Math.min(scanImg.w * 0.264, maxW);
    let ih = iw / ratio;
    if (ih > maxH) { ih = maxH; iw = maxH * ratio; }
    if (iw > maxW) { iw = maxW; ih = maxW / ratio; }
    const ix = ML + (CW - iw) / 2;

    doc.setDrawColor(200, 200, 200);
    doc.rect(ML, y, CW, ih + 4, "D");
    doc.addImage(scanImg.data, "JPEG", ix, y + 2, iw, ih);
    y += ih + 10;
  }

  // ── DISCLAIMER ──
  doc.setDrawColor(200, 200, 200);
  doc.line(ML, y, ML + CW, y);
  y += 5;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  const disc = "This report is AI-generated and for informational purposes only. Always consult a qualified doctor before making any medical decisions.";
  doc.text(doc.splitTextToSize(disc, CW), ML, y);

  doc.save(`MedAI_Report_${reportId}.pdf`);
}
