const mongoose = require('mongoose');
const ApiError = require('./ApiError');

function parseObjectId(value, label = 'ID') {
  if (value == null || value === '') {
    throw new ApiError(400, `${label} is required`);
  }
  const id = value.toString().trim();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
  return id;
}

module.exports = { parseObjectId };
