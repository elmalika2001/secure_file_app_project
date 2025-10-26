import React, { useState } from 'react';
import { downloadFile, deleteFile, shareFile } from '../services/files';

function FileList({ files, onFileDeleted, onMFARequired, mfaToken }) {
  const [downloading, setDownloading] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async (fileId, filename) => {
    setDownloading(fileId);
    setError('');

    try {
      const response = await downloadFile(fileId, mfaToken || null);

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      if (error.message.includes('MFA token required')) {
        onMFARequired();
      } else {
        setError(error.message);
      }
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    setDeleting(fileId);
    setError('');

    try {
      await deleteFile(fileId, mfaToken || null);
      onFileDeleted();
    } catch (error) {
      if (error.message.includes('MFA token required')) {
        onMFARequired();
      } else {
        setError(error.message);
      }
    } finally {
      setDeleting(null);
    }
  };

  const handleShare = async (fileId) => {
    const userId = prompt('Enter user ID to share with:');
    if (!userId) return;

    try {
      await shareFile(fileId, userId, mfaToken || null);
      alert('File shared successfully!');
      onFileDeleted(); // Refresh list
    } catch (error) {
      if (error.message.includes('MFA token required')) {
        onMFARequired();
      } else {
        setError(error.message);
      }
    }
  };

  if (files.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <p className="text-muted">No files uploaded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5>Your Files</h5>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Filename</th>
                <th>Size</th>
                <th>Uploaded By</th>
                <th>Uploaded At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td>{file.filename}</td>
                  <td>{formatFileSize(file.size)}</td>
                  <td>{file.uploadedBy}</td>
                  <td>{formatDate(file.uploadedAt)}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => handleDownload(file.id, file.filename)}
                        disabled={downloading === file.id}
                      >
                        {downloading === file.id ? 'Downloading...' : 'Download'}
                      </button>
                      <button
                        className="btn btn-outline-info"
                        onClick={() => handleShare(file.id)}
                      >
                        Share
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(file.id)}
                        disabled={deleting === file.id}
                      >
                        {deleting === file.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FileList;
