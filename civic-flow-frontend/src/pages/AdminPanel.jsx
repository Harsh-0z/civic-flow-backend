import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, issuesAPI } from '../api/axios';
import '../styles/admin.css';

const AdminPanel = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [issues, setIssues] = useState([]);
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Fetch data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersData, issuesData] = await Promise.all([
                adminAPI.getUsers(),
                issuesAPI.getAll()
            ]);
            setUsers(usersData);
            setIssues(issuesData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            showToast('Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDeleteUser = async (userId, userEmail) => {
        if (!window.confirm(`Are you sure you want to delete ${userEmail}?`)) {
            return;
        }

        try {
            await adminAPI.deleteUser(userId);
            showToast('User deleted successfully');
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            showToast(error.response?.data || 'Failed to delete user', 'error');
        }
    };

    const handleResolveIssue = async (issueId) => {
        try {
            await issuesAPI.updateStatus(issueId, 'RESOLVED');
            showToast('Issue resolved successfully');
            fetchData();
        } catch (error) {
            showToast('Failed to resolve issue', 'error');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Filter users by role
    const officials = users.filter(u => u.role === 'OFFICIAL');
    const citizens = users.filter(u => u.role === 'CITIZEN');
    const admins = users.filter(u => u.role === 'ADMIN');

    // Filter issues
    const openIssues = issues.filter(i => i.status === 'OPEN');
    const inProgressIssues = issues.filter(i => i.status === 'IN_PROGRESS');

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Loading Admin Panel...</p>
            </div>
        );
    }

    return (
        <div className="admin-panel">
            {/* Toast */}
            {toast && (
                <div className={`toast toast-${toast.type}`}>
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <header className="admin-header">
                <div className="admin-brand">
                    <div className="admin-logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <div>
                        <h1>CivicFlow Admin</h1>
                        <p>Management Dashboard</p>
                    </div>
                </div>

                <div className="admin-actions">
                    <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            <polyline points="9,22 9,12 15,12 15,22" />
                        </svg>
                        Back to Map
                    </button>
                    <button className="navbar-logout" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="admin-stats">
                <div className="stat-card admin-stat">
                    <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                        </svg>
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{users.length}</span>
                        <span className="stat-label">Total Users</span>
                    </div>
                </div>

                <div className="stat-card admin-stat">
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4z" />
                        </svg>
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{officials.length}</span>
                        <span className="stat-label">Officials</span>
                    </div>
                </div>

                <div className="stat-card admin-stat">
                    <div className="stat-icon open">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{openIssues.length}</span>
                        <span className="stat-label">Open Issues</span>
                    </div>
                </div>

                <div className="stat-card admin-stat">
                    <div className="stat-icon in-progress">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83" />
                        </svg>
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{inProgressIssues.length}</span>
                        <span className="stat-label">In Progress</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="admin-tabs">
                <button
                    className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                    </svg>
                    Users
                </button>
                <button
                    className={`admin-tab ${activeTab === 'issues' ? 'active' : ''}`}
                    onClick={() => setActiveTab('issues')}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    Issues ({openIssues.length + inProgressIssues.length})
                </button>
            </div>

            {/* Content */}
            <div className="admin-content">
                {activeTab === 'users' && (
                    <div className="users-section">
                        {/* Officials */}
                        <div className="user-group">
                            <h3>
                                <span className="group-icon">🏛️</span>
                                Officials ({officials.length})
                            </h3>
                            <div className="user-list">
                                {officials.length === 0 ? (
                                    <p className="empty-state">No officials registered</p>
                                ) : (
                                    officials.map(u => (
                                        <div key={u.id} className="user-card">
                                            <div className="user-avatar official">
                                                {u.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="user-info">
                                                <span className="user-email">{u.email}</span>
                                                <span className="user-dept">{u.department || 'No department'}</span>
                                            </div>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDeleteUser(u.id, u.email)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Citizens */}
                        <div className="user-group">
                            <h3>
                                <span className="group-icon">👤</span>
                                Citizens ({citizens.length})
                            </h3>
                            <div className="user-list">
                                {citizens.length === 0 ? (
                                    <p className="empty-state">No citizens registered</p>
                                ) : (
                                    citizens.map(u => (
                                        <div key={u.id} className="user-card">
                                            <div className="user-avatar citizen">
                                                {u.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="user-info">
                                                <span className="user-email">{u.email}</span>
                                                <span className="user-dept">Citizen</span>
                                            </div>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDeleteUser(u.id, u.email)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Admins (view only) */}
                        <div className="user-group">
                            <h3>
                                <span className="group-icon">⚙️</span>
                                Administrators ({admins.length})
                            </h3>
                            <div className="user-list">
                                {admins.map(u => (
                                    <div key={u.id} className="user-card">
                                        <div className="user-avatar admin">
                                            {u.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="user-info">
                                            <span className="user-email">{u.email}</span>
                                            <span className="user-dept">System Administrator</span>
                                        </div>
                                        <span className="protected-badge">Protected</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'issues' && (
                    <div className="issues-section">
                        {openIssues.length === 0 && inProgressIssues.length === 0 ? (
                            <div className="empty-state-large">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <h3>All Issues Resolved!</h3>
                                <p>There are no pending issues at the moment.</p>
                            </div>
                        ) : (
                            <div className="issues-list">
                                {[...openIssues, ...inProgressIssues].map(issue => (
                                    <div key={issue.id} className="issue-card">
                                        {issue.imageUrl && (
                                            <img src={issue.imageUrl} alt={issue.title} className="issue-image" />
                                        )}
                                        <div className="issue-content">
                                            <div className="issue-header">
                                                <h4>{issue.title}</h4>
                                                <span className={`badge badge-${issue.status.toLowerCase().replace('_', '-')}`}>
                                                    {issue.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="issue-desc">{issue.description}</p>
                                            <div className="issue-meta">
                                                <span>📍 {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}</span>
                                                <span>👤 {issue.reporter?.email || 'Unknown'}</span>
                                            </div>
                                            <div className="issue-actions">
                                                {issue.status === 'OPEN' && (
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => issuesAPI.updateStatus(issue.id, 'IN_PROGRESS').then(fetchData)}
                                                    >
                                                        Start Work
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleResolveIssue(issue.id)}
                                                >
                                                    ✓ Mark Resolved
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
