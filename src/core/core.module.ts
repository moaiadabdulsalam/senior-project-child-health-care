import { Global, Module } from '@nestjs/common';
import { RoleGuard } from './guard/role.guard';
import { JwtAuthGuard } from '../modules/auth/guard/jwt.guard';

@Global()
@Module({
  providers: [RoleGuard],
  exports: [RoleGuard],
})
export class CoreModule {}
