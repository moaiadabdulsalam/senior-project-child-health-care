import { Controller } from '@nestjs/common';
import { AdminService } from '../services/admin.service';

@Controller('admin')
export class AdminController {

    constructor(private readonly adminService : AdminService){}

    
}
/*
total doctor , total parent , total child ,
doctor profile , speciality , total active user ,
*/