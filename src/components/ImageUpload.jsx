import { useState, useCallback } from "react";
import { FiUpload, FiX, FiImage } from "react-icons/fi";

const ImageUpload = ({ onFileSelect, label = "Upload Medical Image", accept = "image/*", preview = true, externalPreview = null, externalFileName = "" }) => {
  const [dragOver, setDragOver] = useState(false);
  const [internalPreview, setInternalPreview] = useState(null);
  const [internalFileName, setInternalFileName] = useState("");

  const previewUrl = externalPreview ?? internalPreview;
  const fileName = externalFileName || internalFileName;

  const handleFile = useCallback((file) => {
    if (!file) return;
    setInternalFileName(file.name);
    if (preview) {
      const reader = new FileReader();
      reader.onload = (e) => setInternalPreview(e.target.result);
      reader.readAsDataURL(file);
    }
    onFileSelect(file);
  }, [onFileSelect, preview]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    setInternalPreview(null);
    setInternalFileName("");
    onFileSelect(null);
  };

  return (
    <div className="space-y-3">
      <label className="label">{label}</label>
      {!previewUrl ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${dragOver ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/50"}`}
        >
          <input type="file" accept={accept} onChange={handleChange} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="cursor-pointer">
            <FiUpload className="mx-auto mb-3 text-slate-400" size={32} />
            <p className="text-slate-600 font-medium">Drag & drop or <span className="text-blue-600">browse</span></p>
            <p className="text-slate-400 text-sm mt-1">Supports JPG, PNG, DICOM files</p>
          </label>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-black">
          <img src={previewUrl} alt="Preview" className="w-full object-contain" />
          <div className="flex items-center gap-2 bg-slate-50 border-t border-slate-200 px-3 py-2">
            <FiImage size={16} className="text-blue-600 flex-shrink-0" />
            <span className="text-sm font-medium text-slate-700 truncate flex-1">{fileName}</span>
            <button onClick={clearFile} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex-shrink-0">
              <FiX size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
