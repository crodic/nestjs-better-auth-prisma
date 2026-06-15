import { Module, Global } from '@nestjs/common';
import { createAuth } from '../common/auth/auth';
import { PrismaService } from '../common/prisma/prisma.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';

@Global()
@Module({
  imports: [
    PrismaModule,
    BetterAuthModule.forRootAsync({
      imports: [PrismaModule],
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => ({
        auth: createAuth(new PrismaService()),
        bodyParser: {
          json: { limit: '2mb' },
          urlencoded: { limit: '2mb', extended: true },
          rawBody: true,
        },
      }),
    }),
  ],
})
export class AuthModule {}
