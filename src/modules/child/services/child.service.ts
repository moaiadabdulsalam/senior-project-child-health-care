import { Injectable, NotFoundException } from '@nestjs/common';
import { ChildRepository } from '../repositories/child.repository';

@Injectable()
export class ChildService {
  constructor(private childRepo: ChildRepository) {}

  getAll() {}

  async getById(id: string) {
    const child = await this.childRepo.findById(id);
    if (!child) {
      throw new NotFoundException('Child Not Found');
    }
    return child;
  }

  createChild() {}

  updateChild() {}

  deleteChild() {}
}
