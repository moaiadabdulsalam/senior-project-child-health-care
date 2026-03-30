import { Injectable } from '@nestjs/common';
import { medicationRepository } from '../repositories/medication.repositories';

@Injectable()
export class MedicationService {
    constructor(private readonly medicationRepo : medicationRepository){}
}
