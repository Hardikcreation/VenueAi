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
      const response = await vendorAPI.getImages();
      setImages(response || []);
      setError('');
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to fetch images');
      setImages([]);
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="space-y-5">
      <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_45px_rgba(109,40,217,0.08)]">
        <h1 className="text-3xl font-extrabold text-[#22103D]">Gallery Manager</h1>
        <p className="mt-2 text-sm text-[#7D6F95]">Strong photos lift trust, clicks and conversion across the new marketplace cards.</p>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <ImageUploadForm refresh={fetchImages} />

      <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_45px_rgba(109,40,217,0.08)]">
        <h2 className="text-xl font-bold text-[#22103D]">Your Images ({images.length})</h2>

        {loading ? (
          <div className="py-12 text-center text-sm text-[#7D6F95]">Loading images...</div>
        ) : images.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {images.map((image, index) => (
              <div key={`${image}-${index}`} className="overflow-hidden rounded-[22px] bg-[#F8F5FF]">
                <img
                  src={image.url || image}
                  alt={`Gallery ${index + 1}`}
                  className="h-36 w-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-[24px] bg-[#F8F5FF] p-6 text-center text-sm text-[#7D6F95]">
            No images uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorImages;
