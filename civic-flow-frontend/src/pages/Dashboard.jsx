import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import { issuesAPI } from '../api/axios';
import IssueModal from '../components/IssueModal';
import 'leaflet/dist/leaflet.css';
import '../styles/dashboard.css';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different statuses
const createCustomIcon = (status) => {
    const colors = {
        OPEN: '#ef4444',
        IN_PROGRESS: '#f59e0b',
        RESOLVED: '#22c55e',
    };

    const icons = {
        OPEN: '⚠️',
        IN_PROGRESS: '🔧',
        RESOLVED: '✅',
    };

    return L.divIcon({
        className: 'custom-marker-wrapper',
        html: `
      <div class="custom-marker marker-${status.toLowerCase().replace('_', '-')}" style="background: ${colors[status]}">
        <span class="custom-marker-inner">${icons[status]}</span>
      </div>
    `,
        iconSize: [36, 42],
        iconAnchor: [18, 42],
        popupAnchor: [0, -42],
    });
};

// Location picker component
const LocationPicker = ({ onLocationSelect, isSelecting }) => {
    useMapEvents({
        click: (e) => {
            if (isSelecting) {
                onLocationSelect(e.latlng);
            }
        },
    });
    return null;
};

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isSelectingLocation, setIsSelectingLocation] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [toast, setToast] = useState(null);

    // Vadodara coordinates
    const mapCenter = [22.3072, 73.1812];

    // Fetch issues
    const fetchIssues = useCallback(async () => {
        try {
            const data = await issuesAPI.getAll();
            setIssues(data);
        } catch (error) {
            console.error('Failed to fetch issues:', error);
            showToast('Failed to load issues', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchIssues();
    }, [fetchIssues]);

    // Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Handle logout
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Handle location selection
    const handleLocationSelect = (latlng) => {
        setSelectedLocation(latlng);
        setIsSelectingLocation(false);
        setShowModal(true);
    };

    // Start location selection
    const startLocationSelection = () => {
        setIsSelectingLocation(true);
        setSelectedLocation(null);
    };

    // Cancel location selection
    const cancelLocationSelection = () => {
        setIsSelectingLocation(false);
        setSelectedLocation(null);
    };

    // Handle issue submission
    const handleIssueSubmit = async (formData) => {
        try {
            await issuesAPI.create(formData);
            showToast('Issue reported successfully!');
            setShowModal(false);
            setSelectedLocation(null);
            fetchIssues(); // Refresh issues
        } catch (error) {
            console.error('Failed to report issue:', error);
            showToast('Failed to report issue', 'error');
        }
    };

    // Handle status update
    const handleStatusUpdate = async (issueId, status) => {
        try {
            await issuesAPI.updateStatus(issueId, status);
            showToast(`Issue marked as ${status.toLowerCase()}`);
            fetchIssues(); // Refresh issues
        } catch (error) {
            console.error('Failed to update status:', error);
            showToast('Failed to update status', 'error');
        }
    };

    // Calculate stats
    const stats = {
        open: issues.filter(i => i.status === 'OPEN').length,
        inProgress: issues.filter(i => i.status === 'IN_PROGRESS').length,
        resolved: issues.filter(i => i.status === 'RESOLVED').length,
    };

    // Check if user can update status
    const canUpdateStatus = user?.role === 'OFFICIAL' || user?.role === 'ADMIN';

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Loading CivicFlow...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Toast Notification */}
            {toast && (
                <div className={`toast toast-${toast.type}`}>
                    {toast.message}
                </div>
            )}

            {/* Navbar */}
            <nav className="navbar">
                <div className="navbar-brand">
                    <div className="navbar-logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className="navbar-title">CivicFlow</span>
                </div>

                <div className="navbar-actions">
                    <div className="navbar-user">
                        <div className="navbar-avatar">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="navbar-user-info">
                            <span className="navbar-email">{user?.email}</span>
                            <span className="navbar-role">{user?.role}</span>
                        </div>
                    </div>
                    {user?.role === 'ADMIN' && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate('/admin')}
                            style={{ marginRight: '0.5rem' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                            Admin Panel
                        </button>
                    )}
                    <button className="navbar-logout" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </nav>

            {/* Map Container */}
            <div className="map-container">
                {/* Stats Bar */}
                <div className="stats-bar">
                    <div className="stat-card">
                        <div className="stat-icon open">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.open}</span>
                            <span className="stat-label">Open</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon in-progress">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.inProgress}</span>
                            <span className="stat-label">In Progress</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon resolved">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.resolved}</span>
                            <span className="stat-label">Resolved</span>
                        </div>
                    </div>
                </div>

                {/* Leaflet Map */}
                <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ width: '100%', height: '100%' }}
                    zoomControl={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    <LocationPicker
                        onLocationSelect={handleLocationSelect}
                        isSelecting={isSelectingLocation}
                    />

                    {/* Issue Markers */}
                    {issues.map((issue) => (
                        <Marker
                            key={issue.id}
                            position={[issue.latitude, issue.longitude]}
                            icon={createCustomIcon(issue.status)}
                        >
                            <Popup>
                                <div className="issue-popup">
                                    {issue.imageUrl ? (
                                        <img
                                            src={issue.imageUrl}
                                            alt={issue.title}
                                            className="issue-popup-image"
                                        />
                                    ) : (
                                        <div className="issue-popup-no-image">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                                <path d="M21 15l-5-5L5 21" />
                                            </svg>
                                            No image
                                        </div>
                                    )}

                                    <div className="issue-popup-header">
                                        <h3 className="issue-popup-title">{issue.title}</h3>
                                        <span className={`badge badge-${issue.status.toLowerCase().replace('_', '-')}`}>
                                            {issue.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <p className="issue-popup-description">{issue.description}</p>

                                    <div className="issue-popup-meta">
                                        <div className="issue-popup-reporter">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                            <span>Reported by: {issue.reporter?.email || 'Unknown'}</span>
                                        </div>
                                    </div>

                                    {/* Official Controls */}
                                    {canUpdateStatus && issue.status !== 'RESOLVED' && (
                                        <div className="issue-popup-actions">
                                            {issue.status === 'OPEN' && (
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleStatusUpdate(issue.id, 'IN_PROGRESS')}
                                                >
                                                    Start Work
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => handleStatusUpdate(issue.id, 'RESOLVED')}
                                            >
                                                ✓ Mark Resolved
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Temporary marker for selected location */}
                    {selectedLocation && (
                        <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                            <Popup>New issue location</Popup>
                        </Marker>
                    )}
                </MapContainer>

                {/* Floating Controls */}
                <div className="floating-controls">
                    {isSelectingLocation ? (
                        <>
                            <div className="location-help active">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                Click on the map to select location
                            </div>
                            <button className="btn btn-secondary" onClick={cancelLocationSelection}>
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button className="report-btn" onClick={startLocationSelection}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="16" />
                                <line x1="8" y1="12" x2="16" y2="12" />
                            </svg>
                            Report Problem
                        </button>
                    )}
                </div>
            </div>

            {/* Issue Modal */}
            {showModal && selectedLocation && (
                <IssueModal
                    location={selectedLocation}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedLocation(null);
                    }}
                    onSubmit={handleIssueSubmit}
                />
            )}
        </div>
    );
};

export default Dashboard;
