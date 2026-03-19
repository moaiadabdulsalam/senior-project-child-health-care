import { Controller } from '@nestjs/common';
import { DoctorService } from '../services/doctor.service';

@Controller('doctor')
export class DoctorController {
    constructor(private readonly doctorService : DoctorService){}

}




/*
total revenue

Bookings (Last 30 Days)

Today’s Appointments

Average Patient Age

Gender Distribution*/