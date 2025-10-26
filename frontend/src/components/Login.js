import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/auth';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mfaToken: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(formData.email, formData.password, formData.mfaToken || null);

      if (data.user && !data.user.mfaEnabled && !showMFA) {
        // MFA not enabled, proceed to dashboard
        onLogin(data.user);
        navigate('/dashboard');
      } else if (data.user && data.user.mfaEnabled && !showMFA) {
        // MFA enabled, show MFA input
        setShowMFA(true);
      } else if (showMFA) {
        // MFA token provided, login successful
        onLogin(data.user);
        navigate('/dashboard');
      }
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
              <h3 className="text-center">Login to Secure File Sharing</h3>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                {showMFA && (
                  <div className="mb-3">
                    <label htmlFor="mfaToken" className="form-label">MFA Token</label>
                    <input
                      type="text"
                      className="form-control"
                      id="mfaToken"
                      name="mfaToken"
                      value={formData.mfaToken}
                      onChange={handleChange}
                      placeholder="Enter your 6-digit MFA code"
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : showMFA ? 'Verify MFA' : 'Login'}
                </button>
              </form>

              <div className="text-center mt-3">
                <p>Don't have an account? <Link to="/register">Register here</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
