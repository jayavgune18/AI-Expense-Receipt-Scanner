const authService = require('../services/authService');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    await emailService.sendWelcomeEmail(result.user).catch((err) => logger.error('Welcome email failed:', err));
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.statusCode === 401) {
      return res.status(401).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logoutUser(req.user._id);
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.cookies;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }
    const tokens = await authService.refreshUserToken(token);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, data: { accessToken: tokens.accessToken } });
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'preferences'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await req.user.constructor.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const user = await req.user.constructor.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = req.body.newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { resetToken, user } = await authService.generatePasswordResetToken(req.body.email);
    await emailService.sendPasswordResetEmail(user, resetToken).catch((err) => logger.error('Reset email failed:', err));
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.params.token, req.body.password);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  register, login, logout, refreshToken,
  getProfile, updateProfile, changePassword,
  forgotPassword, resetPassword,
};