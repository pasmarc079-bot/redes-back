import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../repository/prisma';
import { AppError } from '../middleware/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '86400000';

/** Secrets that must never reach production: with them anyone can forge an admin token. */
const WEAK_SECRETS = ['dev-secret-change-in-production', 'REDES_CHANGE_ME', 'CHANGE_ME', 'secret', 'redes'];

export const isJwtSecretSecure = (): boolean =>
  !WEAK_SECRETS.includes(JWT_SECRET) && JWT_SECRET.length >= 32;

/**
 * Refuses to sign tokens while the secret is weak. The public site keeps working, but nobody
 * can sign in until the server is configured properly.
 */
const assertSecureSecret = () => {
  if (process.env.NODE_ENV === 'production' && !isJwtSecretSecure()) {
    throw new AppError(
      'El servidor no está configurado de forma segura: define JWT_SECRET con un valor aleatorio de 32 caracteres o más en las variables de entorno.',
      503,
    );
  }
};

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    roles: string[];
  };
}

export const login = async ({ username, password }: LoginInput): Promise<LoginResponse> => {
  assertSecureSecret();

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email: username }],
    },
    include: { roles: true },
  });

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated', 403);
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: parseInt(JWT_EXPIRATION) }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      roles: user.roles.map((r) => r.role),
    },
  };
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
      roles: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return {
    ...user,
    roles: user.roles.map((r) => r.role),
  };
};
