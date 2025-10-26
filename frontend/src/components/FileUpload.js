import React, { useState } from 'react';
import { uploadFile } from '../services/files';

function FileUpload({ onFileUploaded, onMFARequired, mfaToken }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Basic client-side validation
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (selectedFile.size > maxSize) {
        setError('File size must be less than 50MB');
        return;
      }

      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        setError('File type not allowed. Please upload images, PDFs, or documents.');
        return;
      }

      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      await uploadFile(file, mfaToken || null);
      setSuccess('File uploaded successfully!');
      setFile(null);
      // Reset file input
      document.getElementById('fileInput').value = '';
      onFileUploaded();
    } catch (error) {
      if (error.message.includes('MFA token required')) {
        onMFARequired();
      } else {
        setError(error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5>Upload File</h5>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleUpload}>
          <div className="mb-3">
            <label htmlFor="fileInput" className="form-label">Choose file to upload</label>
            <input
              type="file"
              className="form-control"
              id="fileInput"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.gif,.pdf,.txt,.doc,.docx"
            />
            <div className="form-text">
              Max file size: 50MB. Allowed types: Images, PDFs, Text files, Word documents.
            </div>
          </div>

          {file && (
            <div className="mb-3">
              <p className="mb-1"><strong>Selected file:</strong> {file.name}</p>
              <p className="mb-1"><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <p className="mb-0"><strong>Type:</strong> {file.type}</p>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FileUpload;
