import { betterAuth } from 'better-auth';
import type { Auth, BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { admin, openAPI } from 'better-auth/plugins';
import { ConfigService } from '@nestjs/config';

type AuthOptions = BetterAuthOptions & {
  plugins: [ReturnType<typeof openAPI>, ReturnType<typeof admin>];
};

export function createAuth(
  prisma: PrismaService,
  configService: ConfigService,
): Auth<AuthOptions> {
  return betterAuth<AuthOptions>({
    database: prismaAdapter(prisma, { provider: 'postgresql' }), // Make it coherent with your schema file
    appName: configService.get<string>('APP_NAME') ?? 'YOUR_APP',
    secret: configService.get<string>('BETTER_AUTH_SECRET') ?? 'secret',
    baseURL:
      configService.get<string>('BETTER_AUTH_URL') ?? 'http://localhost:3000',
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      //   Auto Rotation if user is active
      updateAge: 60 * 40 * 24,
      //   Anti violation session
      freshAge: 60 * 60 * 2,
    },
    advanced: {
      cookies: {
        sessionToken: {
          name: 'yourapp.session',
          attributes: {
            httpOnly: true,
            sameSite: 'lax',
            secure: configService.get<string>('NODE_ENV') === 'production',
            path: '/',
          },
        },
      },
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 100,
    },
    trustedOrigins: ['http://localhost:3000', 'http://localhost:3001'],
    plugins: [openAPI({}), admin()],
  });
}
