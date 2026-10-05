import bcrypt from 'bcrypt';

const saltRounds = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (plainPassword: string, hashedPassword: string) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

