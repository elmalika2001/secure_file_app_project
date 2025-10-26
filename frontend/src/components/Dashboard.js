import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import FileList from './FileList';
import { getFiles } from '../services/files';

function Dashboard({ user }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [showMFA, setShowMFA] = useState(false);

  const fetchFiles = async (token = null) => {
    try {
      setError('');
      const fileList = await getFiles(token);
      setFiles(fileList);
      setShowMFA(false);
    } catch (error) {
      if (error.message.includes('MFA token required')) {
        setShowMFA(true);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUploaded = () => {
    fetchFiles(mfaToken || null);
  };

  const handleFileDeleted = () => {
    fetchFiles(mfaToken || null);
  };

  const handleMFARequired = () => {
    setShowMFA(true);
  };

  const handleMFASubmit = (e) => {
    e.preventDefault();
    fetchFiles(mfaToken);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h2>Welcome, {user?.username}!</h2>
          <p className="text-muted">Securely upload, download, and share your files.</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showMFA && (
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5>MFA Required</h5>
                <form onSubmit={handleMFASubmit}>
                  <div className="mb-3">
                    <label htmlFor="mfaToken" className="form-label">Enter MFA Token</label>
                    <input
                      type="text"
                      className="form-control"
                      id="mfaToken"
                      value={mfaToken}
                      onChange={(e) => setMfaToken(e.target.value)}
                      placeholder="000000"
                      maxLength="6"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Verify
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-md-4">
          <FileUpload
            onFileUploaded={handleFileUploaded}
            onMFARequired={handleMFARequired}
            mfaToken={mfaToken}
          />
        </div>
        <div className="col-md-8">
          <FileList
            files={files}
            onFileDeleted={handleFileDeleted}
            onMFARequired={handleMFARequired}
            mfaToken={mfaToken}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
