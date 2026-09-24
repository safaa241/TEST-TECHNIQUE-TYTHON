import { loginUser, getCurrentUser } from '../services/auth.service.js';
import { loginSchema } from '../validators/auth.validator.js';
import { AppError } from '../utils/AppError.js';

export const login = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(400, 'Validation failed', parsed.error.flatten().fieldErrors);
    }

    const data = await loginUser(parsed.data);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const data = await getCurrentUser(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
