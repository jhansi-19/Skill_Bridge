const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccessToken } = require('../utils/tokenUtils');

const protect = asyncHandler(async (req, res, next) => {
  let token =
    req.cookies?.accessToken ||
    (req.headers.authorization?.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (!token) {
    throw new ApiError(401, 'Not authorized. Please log in.');
  }

  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.id);

  if (!user) throw new ApiError(401, 'User no longer exists');
  if (user.isBanned) throw new ApiError(403, 'Your account has been suspended');

  req.user = user;
  next();
});

const authorize = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission for this action');
    }
    next();
  });

const optionalAuth = asyncHandler(async (req, res, next) => {
  let token =
    req.cookies?.accessToken ||
    (req.headers.authorization?.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      req.user = await User.findById(decoded.id);
    } catch {
      req.user = null;
    }
  }
  next();
});

module.exports = { protect, authorize, optionalAuth };
