import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './core/core.module';
import { ChildModule } from './modules/child/child.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    CoreModule,
    ChildModule,
  ],
})
export class AppModule {}
