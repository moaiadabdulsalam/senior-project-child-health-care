import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { MedicationService } from '../services/medication.service';

@Controller('medication')
export class MedicationController {

    constructor(private readonly medicationService : MedicationService){}


    @Get()
    getAllMedication(){}

    @Get('/:id')
    getOne(){}

    @Post()
    createMedication(){}

    @Patch('/:id')
    updateMedication(){}

    @Delete('/:id')
    deleteMedication(){}
    
}
