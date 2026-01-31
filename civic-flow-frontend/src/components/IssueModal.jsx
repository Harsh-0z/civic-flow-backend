import { useState } from 'react';

const IssueModal = ({ location, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('latitude', location.lat);
        formData.append('longitude', location.lng);
        if (image) {
            formData.append('image', image);
        }

        try {
            await onSubmit(formData);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content issue-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <h2>Report an Issue</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    <form className="issue-form" onSubmit={handleSubmit}>
                        {/* Location Preview */}
                        <div className={`location-preview ${location ? 'selected' : ''}`}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>
                                Location: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                            </span>
                        </div>

                        {/* Title */}
                        <div className="input-group">
                            <label>Issue Title *</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., Pothole on Main Street"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="input-group">
                            <label>Description *</label>
                            <textarea
                                className="input"
                                placeholder="Describe the issue in detail..."
                                rows="4"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                style={{ resize: 'vertical', minHeight: '100px' }}
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="input-group">
                            <label>Photo (Optional)</label>
                            <div className="file-upload">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="file-upload-input"
                                    id="image-upload"
                                />
                                <label htmlFor="image-upload" className="file-upload-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <path d="M21 15l-5-5L5 21" />
                                    </svg>
                                    <span>Click to upload a photo</span>
                                </label>
                            </div>

                            {imagePreview && (
                                <div className="file-upload-preview">
                                    <img src={imagePreview} alt="Preview" />
                                    <button
                                        type="button"
                                        className="file-upload-remove"
                                        onClick={removeImage}
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: '0.5rem' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading || !title || !description}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                        Submit Report
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default IssueModal;
