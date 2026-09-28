import React, { useState, useEffect } from "react";
import { filesApi } from "../services/api";
import { HardDrive, Upload, Download, Trash2, File, Image, FileText, RefreshCw, Check, AlertCircle, Info } from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";

export default function CloudFilesPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await filesApi.listFiles();
      setFiles(data);
    } catch (err) {
      setError("Failed to query cloud object storage: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage("");
    setError("");

    try {
      const res = await filesApi.uploadFile(file);
      setMessage(`Object "${res.file.filename}" successfully uploaded to Cloud Object Storage bucket!`);
      loadFiles();
    } catch (err) {
      setError("Cloud upload error: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      await filesApi.downloadFile(fileId, filename);
    } catch (err) {
      setError("Download failed: " + err.message);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Delete this object from Cloud Object Storage?")) return;
    try {
      await filesApi.deleteFile(fileId);
      setFiles(files.filter((f) => f.file_id !== fileId));
      setMessage("Object removed from bucket and metadata deleted.");
    } catch (err) {
      setError("Delete failed: " + err.message);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (contentType, filename) => {
    if (contentType?.includes("image") || filename?.match(/\.(png|jpe?g|webp|gif)$/i)) {
      return <Image className="text-orange" size={24} />;
    }
    if (filename?.endsWith(".json") || filename?.endsWith(".txt")) {
      return <FileText className="text-blue" size={24} />;
    }
    return <File className="text-purple" size={24} />;
  };

  return (
    <div className="cloud-files-container">
      <div className="page-header-row">
        <div>
          <h2>Cloud Object Storage (S3 / Blob Bucket)</h2>
          <p className="page-subtitle">
            Unstructured storage for user meal photos, food logs, and exported diet documents partitioned by tenant namespace.
          </p>
        </div>

        {/* Upload Button */}
        <label className="btn btn-primary cursor-pointer">
          <Upload size={16} />
          <span>{uploading ? "Uploading to Cloud..." : "Upload Object / Image"}</span>
          <input
            type="file"
            className="hidden-file-input"
            onChange={handleFileUpload}
            disabled={uploading}
            accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.json,.txt"
          />
        </label>
      </div>

      {/* Cloud Concept Educational Banner */}
      <div className="storage-concept-banner">
        <Info className="concept-info-icon" size={24} />
        <div>
          <h4>Cloud Database vs. Cloud Object Storage</h4>
          <p>
            <strong>Cloud Database (Structured):</strong> Stores user profiles, numerical macros, and schema queries.<br />
            <strong>Cloud Object Storage (Unstructured):</strong> Stores large binary blobs (photos, PDFs, exported plans) identified by UUID keys in an isolated bucket namespace.
          </p>
        </div>
      </div>

      {message && (
        <div className="alert-box alert-success">
          <Check size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="alert-box alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Files List / Grid */}
      {loading ? (
        <div className="loading-state">
          <RefreshCw className="spinner" size={32} />
          <p>Listing objects in Cloud Storage bucket...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="empty-state">
          <HardDrive size={48} className="empty-icon text-muted" />
          <h3>No Objects in Your Cloud Storage Bucket</h3>
          <p>Upload a meal photo, nutrition label, or export a diet plan to see it stored here.</p>
        </div>
      ) : (
        <div className="files-table-container">
          <table className="files-table">
            <thead>
              <tr>
                <th>Object Name</th>
                <th>MIME Type</th>
                <th>File Size</th>
                <th>Uploaded At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.file_id}>
                  <td>
                    <div className="file-name-cell">
                      {getFileIcon(file.content_type, file.filename)}
                      <span className="file-name-text">{file.filename}</span>
                    </div>
                  </td>
                  <td>
                    <span className="type-badge">{file.content_type || "application/octet-stream"}</span>
                  </td>
                  <td>{formatBytes(file.file_size)}</td>
                  <td>{file.uploaded_at ? new Date(file.uploaded_at).toLocaleString() : "Just now"}</td>
                  <td>
                    <div className="action-buttons-cell">
                      <button
                        className="icon-action-btn"
                        onClick={() => handleDownload(file.file_id, file.filename)}
                        title="Download Object"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        className="icon-action-btn text-danger"
                        onClick={() => handleDelete(file.file_id)}
                        title="Delete from Bucket"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DisclaimerBanner compact={true} />
    </div>
  );
}
