import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupMFA, verifyMFA } from '../services/auth';

function MFASetup({ user, onUpdate }) {
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initMFA = async () => {
      try {
        const data = await setupMFA();
        setSecret(data.secret);
        setQrCode(data.qrCode);
      } catch (error) {
        setError('Failed to setup MFA');
      }
    };

    initMFA();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyMFA(token);
      onUpdate({ ...user, mfaEnabled: true });
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-center">Setup Multi-Factor Authentication</h3>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="mb-4">
                <h5>Step 1: Scan QR Code</h5>
                <p>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):</p>
                {qrCode && (
                  <div className="text-center mb-3">
                    <img src={qrCode} alt="MFA QR Code" />
                  </div>
                )}
                <p className="text-muted small">
                  Or manually enter this secret: <code>{secret}</code>
                </p>
              </div>

              <form onSubmit={handleVerify}>
                <div className="mb-3">
                  <h5>Step 2: Enter Verification Code</h5>
                  <label htmlFor="token" className="form-label">Enter the 6-digit code from your authenticator app</label>
                  <input
                    type="text"
                    className="form-control"
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="000000"
                    maxLength="6"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading || token.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify and Enable MFA'}
                </button>
              </form>

              <div className="text-center mt-3">
                <button
                  className="btn btn-link"
                  onClick={() => navigate('/dashboard')}
                >
                  Skip for now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MFASetup;
