import { Global, Module } from '@nestjs/common';
import { RoleGuard } from './guard/role.guard';
import { ParseDatePipe } from './pipe/parse-date.pipe';

@Global()
@Module({
  providers: [RoleGuard , ParseDatePipe],
  exports: [RoleGuard , ParseDatePipe],
})
export class CoreModule {}
