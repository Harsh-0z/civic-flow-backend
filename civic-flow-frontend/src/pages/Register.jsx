import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/axios';
import heroBg from '../assets/hero-bg.png';
import '../styles/auth.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('CITIZEN');
    const [department, setDepartment] = useState('');
    const [adminToken, setAdminToken] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const requiresToken = role === 'OFFICIAL' || role === 'ADMIN';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 3) {
            setError('Password must be at least 3 characters');
            return;
        }

        if (requiresToken && !adminToken.trim()) {
            setError('Admin Token is required for Official/Admin registration');
            return;
        }

        setLoading(true);

        try {
            await authAPI.register(
                email,
                password,
                role,
                department || null,
                requiresToken ? adminToken : null
            );
            setSuccess('Account created successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Background */}
            <div className="auth-hero">
                <img src={heroBg} alt="" className="auth-hero-image" />
                <div className="auth-orb auth-orb-1"></div>
                <div className="auth-orb auth-orb-2"></div>
                <div className="auth-orb auth-orb-3"></div>
            </div>

            {/* Register Card */}
            <div className="auth-card">
                {/* Logo */}
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <h1>Join CivicFlow</h1>
                    <p>Create your account to get started</p>
                </div>

                {/* Form */}
                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="auth-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="auth-success">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            {success}
                        </div>
                    )}

                    <div className="input-group">
                        <label>Email Address</label>
                        <div className="auth-input-wrapper">
                            <input
                                type="email"
                                className="input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <div className="auth-input-wrapper">
                            <input
                                type="password"
                                className="input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <circle cx="12" cy="16" r="1" />
                                <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Confirm Password</label>
                        <div className="auth-input-wrapper">
                            <input
                                type="password"
                                className="input"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Select Your Role</label>
                        <div className="role-selector">
                            <div className="role-option role-citizen">
                                <input
                                    type="radio"
                                    id="role-citizen"
                                    name="role"
                                    value="CITIZEN"
                                    checked={role === 'CITIZEN'}
                                    onChange={(e) => setRole(e.target.value)}
                                />
                                <label htmlFor="role-citizen">
                                    <div className="role-icon">👤</div>
                                    <span>Citizen</span>
                                </label>
                            </div>

                            <div className="role-option role-official">
                                <input
                                    type="radio"
                                    id="role-official"
                                    name="role"
                                    value="OFFICIAL"
                                    checked={role === 'OFFICIAL'}
                                    onChange={(e) => setRole(e.target.value)}
                                />
                                <label htmlFor="role-official">
                                    <div className="role-icon">🏛️</div>
                                    <span>Official</span>
                                </label>
                            </div>

                            <div className="role-option role-admin">
                                <input
                                    type="radio"
                                    id="role-admin"
                                    name="role"
                                    value="ADMIN"
                                    checked={role === 'ADMIN'}
                                    onChange={(e) => setRole(e.target.value)}
                                />
                                <label htmlFor="role-admin">
                                    <div className="role-icon">⚙️</div>
                                    <span>Admin</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Admin Token - shown for Official/Admin */}
                    {requiresToken && (
                        <div className="input-group token-field">
                            <label>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0110 0v4" />
                                </svg>
                                Admin Token <span className="required">*</span>
                            </label>
                            <div className="auth-input-wrapper">
                                <input
                                    type="password"
                                    className="input"
                                    placeholder="Enter admin token"
                                    value={adminToken}
                                    onChange={(e) => setAdminToken(e.target.value)}
                                    required
                                />
                                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                                </svg>
                            </div>
                            <p className="token-hint">
                                Contact your system administrator to get the token
                            </p>
                        </div>
                    )}

                    {/* Department - shown for Official/Admin */}
                    {requiresToken && (
                        <div className="input-group">
                            <label>Department (Optional)</label>
                            <div className="auth-input-wrapper">
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g., Roads & Infrastructure"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                />
                                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4z" />
                                </svg>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary auth-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Creating Account...
                            </>
                        ) : (
                            <>
                                Create Account
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
