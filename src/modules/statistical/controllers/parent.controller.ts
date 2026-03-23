import { Controller } from '@nestjs/common';
import { ParentService } from '../services/parent.service';

@Controller('parent')
export class ParentController {

    constructor(private readonly parentService : ParentService){}

}


/*
child photo if exit + age of child , a medicine ,   an appointment if exist ,  
*/

