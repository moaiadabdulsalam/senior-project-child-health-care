import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PublicLandingService } from './public-landing.service';

@Controller('public')
export class PublicLandingController {
  constructor(private readonly publicLandingService: PublicLandingService) {}

  @SkipThrottle()
  @Get('landing')
  landing() {
    return this.publicLandingService.getLanding();
  }
}
