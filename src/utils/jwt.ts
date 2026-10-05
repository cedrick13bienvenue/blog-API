import jwt from 'jsonwebtoken';

export const SECRET_KEY = process.env.JWT_SECRET || 'your_jwt_secret';

export const generateToken = ({id, email, role, name}: { id: string | number; email: string; role: string; name?: string }): string => {
  return jwt.sign(
    {
      id,
      email,
      role, 
      ...(name ? { name } : {})
    },
    SECRET_KEY,
    { expiresIn: '1d' }
  );
};
