const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const uploadImage = async (file, folder = 'venue-ai') => {
  if (!file) return null;

  // If Cloudinary is configured
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto', timeout: 60000 },
        (error, result) => {
          if (error) {
            console.error('Upload error:', error);
            return reject(error);
          }
          resolve(result.secure_url);
        }
      );

      stream.on('error', (error) => {
        console.error('Stream error:', error);
        reject(error);
      });

      stream.end(file.buffer); // ✅ memoryStorage fix
    });
  }

  // fallback (rare case)
  return null;
};

const uploadImages = async (files, folder = 'venue-ai') => {
  if (!Array.isArray(files) || files.length === 0) return [];

  const uploaded = [];

  for (const file of files) {
    try {
      const image = await uploadImage(file, folder);
      if (image) uploaded.push(image);
    } catch (error) {
      console.error('Error uploading individual image:', error.message);
      // Continue with next file instead of failing entire batch
    }
  }

  return uploaded;
};

module.exports = { uploadImage, uploadImages };