import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {

    const token = req?.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) return res.status(401).json({ message: 'User not found' });

        next();

    } catch (err) {
        return res.status(401).json({ message: 'Token is not valid' });

    }
};