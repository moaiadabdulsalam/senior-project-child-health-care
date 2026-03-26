import { Injectable } from '@nestjs/common';
import { AdminStatisticalRepository } from '../repositories/admin.repository';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepo: AdminStatisticalRepository) {}
  async total() {
    const totalChild = await this.adminRepo.totalChild();
    const totalDoctor = (await this.adminRepo.doctors()).length;
    const totalParent = await this.adminRepo.totalParent();
    const totalActiveUser = await this.adminRepo.totalActiveUser();

    return {
      totalChild: totalChild,
      totalDoctor: totalDoctor,
      totalParent: totalParent,
      totalActiveUser: totalActiveUser,
    };
  }

  async doctorsProfile() {
    return await this.adminRepo.doctors();
  }

  async doctorSpeciality() {
    const data = await this.adminRepo.speciality();

    return data.map((item) => ({
      count: item._count,
      speciality: item.speciality,
    }));
  }

  async genderDistribution() {
    const data = await this.adminRepo.genderDistribution();
    return data.map((item) => ({
      gender: item.gender,
      count: item._count,
    }));
  }
}
