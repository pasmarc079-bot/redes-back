import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../repository/prisma';
import { AppError } from '../middleware/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '86400000';

const MIN_PASSWORD_LENGTH = 10;

export interface PasswordInput {
  currentPassword: string;
  newPassword: string;
}

const assertStrongEnough = (password: string) => {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    throw new AppError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`, 400);
  }
};

const signToken = (user: { id: string; username: string; email: string }) =>
  jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: parseInt(JWT_EXPIRATION) },
  );

/**
 * Changes the password of the signed in user. The current password is required, and a fresh
 * token is returned so the session stays alive after the change.
 */
export const changeOwnPassword = async (userId: string, { currentPassword, newPassword }: PasswordInput) => {
  assertStrongEnough(newPassword);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('Usuario no encontrado', 404);

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) throw new AppError('La contraseña actual no es correcta.', 401);

  if (await bcrypt.compare(newPassword, user.passwordHash)) {
    throw new AppError('La nueva contraseña debe ser distinta de la actual.', 400);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });

  return { token: signToken(user) };
};

/**
 * Sets the password of another account. Only for administrators, so a password can be reset
 * when the person who owns it cannot sign in.
 */
export const setUserPassword = async (username: string, newPassword: string) => {
  assertStrongEnough(newPassword);

  const user = await prisma.user.findFirst({
    where: { OR: [{ username }, { email: username }] },
  });
  if (!user) throw new AppError('Usuario no encontrado', 404);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });

  return { id: user.id, username: user.username };
};
