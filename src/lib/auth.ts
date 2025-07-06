import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { IUser } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export const generateToken = (user: IUser): string => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const authenticate = (handler: any) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      // Add user to request object
      (req as any).user = decoded;
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
};

export const authorize = (roles: string[]) => {
  return (req: any, res: NextApiResponse, next: any) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to access this resource' });
    }

    next();
  };
};
