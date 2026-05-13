import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID, randomBytes, pbkdf2Sync, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, passwordHash: string) {
  const [salt, expectedHash] = passwordHash.split(':');

  if (!salt || !expectedHash) {
    return false;
  }

  const actualHash = pbkdf2Sync(password, salt, 100000, 64, 'sha512');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');

  return expectedBuffer.length === actualHash.length && timingSafeEqual(expectedBuffer, actualHash);
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signup(data: SignupRequest) {
    const email = normalizeEmail(data.email);
    const name = data.name.trim();
    const password = data.password;

    if (!email || !name || !password) {
      throw new BadRequestException('Name, email, and password are required.');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('An account with that email already exists.');
    }

    const user = await this.prisma.user.create({
      data: {
        id: randomUUID(),
        email,
        name,
        passwordHash: hashPassword(password),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Signup successful.',
      user,
    };
  }

  async login(data: LoginRequest) {
    const email = normalizeEmail(data.email);
    const password = data.password;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required.');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        passwordHash: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const { passwordHash, ...safeUser } = user;

    return {
      message: 'Login successful.',
      user: safeUser,
    };
  }
}
