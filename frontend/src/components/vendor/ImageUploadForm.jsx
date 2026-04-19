import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { vendorAPI } from '../../services/api';
import { getErrorMessage } from '../../utils/errors';

const ImageUploadForm = ({ refresh }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState([]);
    const { showToast } = useToast();

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);

        // Generate preview URLs
        const previews = files.map(file => URL.createObjectURL(file));
        setPreview(previews);
    };

    const submit = async (e) => {
        e.preventDefault();
        setError(null);

        if (images.length === 0) {
            setError('Please upload at least one image.');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            for (let i = 0; i < images.length; i++) {
                formData.append('images', images[i]);
            }

            await vendorAPI.uploadImages(formData);
            showToast('Images uploaded successfully.', 'success');
            setImages([]);
            setPreview([]);
            refresh();
        } catch (error) {
            console.error('Failed to upload images', error);
            const message = getErrorMessage(error, 'Failed to upload images. Please try again.');
            setError(message);
            showToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 rounded-lg mt-6">
            <h2 className="text-xl font-semibold mb-4">Upload Images</h2>

            {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}

            <form onSubmit={submit} className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="image-input"
                    />
                    <label htmlFor="image-input" className="cursor-pointer">
                        <p className="text-gray-600">Click to select images or drag and drop</p>
                        <p className="text-sm text-gray-500">Supported formats: JPG, PNG, WebP</p>
                    </label>
                </div>

                {preview.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                        {preview.map((url, index) => (
                            <img key={index} src={url} alt={`Preview ${index}`} className="w-full h-20 object-cover rounded" />
                        ))}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || images.length === 0}
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? 'Uploading...' : `Upload ${images.length} Image(s)`}
                </button>
            </form>
        </div>
    );
};

export default ImageUploadForm;
