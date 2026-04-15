const fs = require('fs/promises');
const path = require('path');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const uploadImage = async (file, folder = 'venue-ai') => {
  if (!file) {
    return null;
  }

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: 'image'
      });
      await fs.unlink(file.path).catch(() => {});
      return result.secure_url;
    } catch (error) {
      await fs.unlink(file.path).catch(() => {});
      throw error;
    }
  }

  return `/uploads/${path.basename(file.path)}`;
};

const uploadImages = async (files, folder = 'venue-ai') => {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  const uploaded = [];
  for (const file of files) {
    const image = await uploadImage(file, folder);
    if (image) {
      uploaded.push(image);
    }
  }

  return uploaded;
};

module.exports = { uploadImage, uploadImages };
