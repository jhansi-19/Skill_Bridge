const { cloudinary } = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

const uploadToCloudinary = (buffer, folder = 'skillbridge') => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      resolve({
        url: `https://placehold.co/400x300?text=Upload`,
        publicId: 'mock-' + Date.now(),
        mock: true,
      });
      return;
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) reject(new ApiError(500, 'File upload failed'));
        else
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            filename: result.original_filename,
            mimetype: result.format,
          });
      }
    );
    stream.end(buffer);
  });
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId || publicId.startsWith('mock-') || !process.env.CLOUDINARY_CLOUD_NAME) return;
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
