import { Controller, Post, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import { Roles } from 'src/core/decorator/role.decorator';
import { RoleGuard } from 'src/core/guard/role.guard';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';


@UseGuards(JwtAuthGuard , RoleGuard ,ThrottlerGuard)
@Roles(Role.PARENT)
@Controller('ai-features')
export class AiFeaturesController {

    @Post('/cry-classfication')
    aiFeaturesCryClassification(){}

    @Post('')
    diagonsisDesiese(){}
    
    @Post('detect')
    detect(){}

    
}
