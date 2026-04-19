import React, { useEffect, useState } from 'react';
import ImageUploadForm from '../../components/vendor/ImageUploadForm';
import { vendorAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';

const VendorImages = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { showToast } = useToast();

    const fetchImages = async () => {
        try {
            setLoading(true);
            const res = await vendorAPI.getImages();
            setImages(res || []);
            setError('');
        } catch (error) {
            console.error('Failed to fetch images', error);
            setImages([]);
            const message = getErrorMessage(error, 'Failed to fetch images');
            setError(message);
            showToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleUploadSuccess = () => {
        fetchImages();
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Gallery</h1>
                <p className="text-gray-600 mb-6">Upload and manage your venue images</p>
            </div>

            {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

            <ImageUploadForm refresh={handleUploadSuccess} />

            <div className="mt-10">
                <h2 className="text-xl font-semibold mb-4">Your Images ({images.length})</h2>
                
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Loading images...</p>
                    </div>
                ) : images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {images.map((img, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={img.url || img}
                                    alt={`Gallery ${index}`}
                                    className="w-full h-32 object-cover rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition flex items-center justify-center">
                                    <span className="text-white opacity-0 group-hover:opacity-100 transition">Image {index + 1}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-500 mb-4">No images uploaded yet</p>
                        <p className="text-sm text-gray-400">Start by uploading your first venue image above</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorImages;
