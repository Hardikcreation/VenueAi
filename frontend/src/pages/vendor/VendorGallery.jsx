import React, { useEffect, useState } from 'react';
import ImageUploadForm from '../../components/vendor/ImageUploadForm';
import { vendorAPI } from '../../services/api';

const VendorGallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const res = await vendorAPI.getImages();
            setImages(res || []);
        } catch (error) {
            console.error('Failed to fetch images', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">Gallery</h1>
            <p className="text-gray-600 mb-6">Manage your venue images</p>

            <ImageUploadForm refresh={fetchImages} />

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Your Images</h2>
                
                {loading ? (
                    <div className="text-center py-8">Loading images...</div>
                ) : images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {images.map((img, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={img.url || img}
                                    alt={`Gallery ${index}`}
                                    className="w-full h-32 object-cover rounded-lg shadow hover:shadow-lg transition"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No images uploaded yet. Start by uploading your first image!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorGallery;
