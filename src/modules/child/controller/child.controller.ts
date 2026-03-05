import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ChildService } from '../services/child.service';

@Controller('child')
export class ChildController {
  constructor(private childService: ChildService) {}

  @Get()
  getAllChild() {}

  @Get('/:id')
  getOneChild(id: string) {
    return this.childService.getById(id);
  }

  @Post()
  CreateChild() {}

  @Patch('/:id')
  updateChild() {}

  @Delete('/:id')
  deleteChild() {}
}
