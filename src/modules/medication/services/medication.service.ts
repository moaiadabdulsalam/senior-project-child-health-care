import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { medicationRepository } from '../repositories/medication.repositories';
import { CreateMedicationDto } from '../dtos/createMedication.dto';
import { UpdateMedicationDto } from '../dtos/updateMedication.dto';
import { MedicationStatus, Prisma, Role } from '@prisma/client';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { ChildService } from 'src/modules/child/services/child.service';
import { MedicationDoseService } from './medication-dose.service';
import { UploadService } from 'src/modules/upload/services/upload.service';

@Injectable()
export class MedicationService {
  constructor(
    private readonly medicationRepo: medicationRepository,
    private readonly userRepo: AuthRepository,
    private readonly childService: ChildService,
    private readonly doseService: MedicationDoseService,
    private readonly uploadService: UploadService,
  ) {}

  private async checkUserAndProfileParent(userId: string) {
    const user = await this.userRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const parentProfile = user.profileParent;
    if (!parentProfile || user.role !== Role.PARENT) {
      throw new NotFoundException('parent profile not found');
    }

    return parentProfile.id;
  }
  async getAllMedication(
    userId: string,
    page: number,
    limit: number,
    search?: string,
    status?: MedicationStatus,
    childId?: string,
  ) {
    const parentId = await this.checkUserAndProfileParent(userId);

    if (page < 1) {
      throw new BadRequestException('page must be greater than 0');
    }
    if (limit < 10) {
      throw new BadRequestException('limit must be grater than 9');
    }

    const skip = (page - 1) * limit;

    const where: Prisma.MedicationWhereInput = {
      parentId,
      ...(status && { status }),
      ...(childId && { childId }),
    };

    const tokent = search?.trim();
    if (tokent?.length) {
      const raw = tokent.split(/\s+/);
      where.AND = raw.map((word) => ({
        OR: [
          {
            medicineName: {
              contains: word,
              mode: 'insensitive',
            },
          },
          {
            mdeicineNameArabic: {
              contains: word,
              mode: 'insensitive',
            },
          },
        ],
      }));
    }

    const count = await this.medicationRepo.count(where);
    const data = await this.medicationRepo.getAllMedication(where, skip, limit);
    return {
      data,
      meta: {
        page,
        limit,
        count,
        skip,
        pageTotal: Math.ceil(count / limit),
      },
    };
  }

  async getOne(id: string) {
    const medication = await this.medicationRepo.getOne(id);
    if (!medication) {
      throw new NotFoundException('medication not found');
    }
    return medication;
  }

  async createMedication(dto: CreateMedicationDto, userId: string, file?: Express.Multer.File) {
    const parentId = await this.checkUserAndProfileParent(userId);
    await this.childService.getById(dto.childId);
    const dataCheck = {
      medinineName: dto.medicineName,
      mdeicineNameArabic: dto.mdeicineNameArabic,
    };
    const existingMedication = await this.medicationRepo.existingMedication(dataCheck);
    if (existingMedication) {
      throw new BadRequestException('medication is aleardy exist');
    }

    let imageDate: { key: string; url: string } | null = null;
    if (file) {
      imageDate = await this.uploadService.uploadImage(file);
    }
    const firstDoseDate = new Date(dto.firstDoseDate);
    const firstDoseTime = new Date(dto.firstDoseTime);

    const data = await this.medicationRepo.createMedication({
      parentId,
      childId: dto.childId,
      medicineName: dto.medicineName,
      mdeicineNameArabic: dto.mdeicineNameArabic ?? undefined,
      medicineAmount: dto.medicineAmount,
      duration: dto.duration,
      firstDoseDate,
      firstDoseTime,
      amountPerDay: dto.amountPerDay,
      status: MedicationStatus.ACTIVE,
      medicineUnit: dto.medicineUnit,
      rememberNotify: dto.rememberNotify,
      ...(imageDate ? { imageKey: imageDate.key, imageUrl: imageDate.url } : {}),
    });

    await this.doseService.generateDoses(data.id);
    return data;
  }

  async updateMedicaion(
    id: string,
    dto: UpdateMedicationDto,
    userId: string,
    file?: Express.Multer.File,
  ) {
    await this.checkUserAndProfileParent(userId);
    if (dto.childId) {
      throw new BadRequestException("can't replace the child");
    }
    let imageDate: { key: string; url: string } | null = null;
    if (file) {
      imageDate = await this.uploadService.uploadImage(file);
    }
    const medication = await this.getOne(id);

    if (medication.status !== MedicationStatus.ACTIVE && dto.status === MedicationStatus.ACTIVE) {
      throw new BadRequestException("You can't reactivate this medication");
    }

    if (dto.medicineName || dto.mdeicineNameArabic) {
      const existingMedicaion = await this.medicationRepo.existingMedication({
        medicineName: dto.medicineName,
        mdeicineNameArabic: dto.mdeicineNameArabic,
      });
      if (existingMedicaion && existingMedicaion.id !== id) {
        throw new ConflictException('Medication already exists');
      }
    }
    const firstDoseDate =  dto.firstDoseDate ? new Date(dto.firstDoseDate) : medication.firstDoseDate;
    const firstDoseTime = dto.firstDoseTime ? new Date(dto.firstDoseTime) : medication.firstDoseTime;
    
    const updatedMediction = await this.medicationRepo.updateMedication(
      {
        medicineName: dto.medicineName ?? undefined,
        mdeicineNameArabic: dto.mdeicineNameArabic ?? undefined,
        medicineAmount: dto.medicineAmount ?? undefined,
        duration: dto.duration ?? undefined,
        firstDoseDate,
        firstDoseTime,
        amountPerDay: dto.amountPerDay ?? undefined,
        status: MedicationStatus.ACTIVE ?? undefined,
        medicineUnit: dto.medicineUnit ?? undefined,
        rememberNotify: dto.rememberNotify ?? undefined,
        ...(imageDate ? { imageKey: imageDate.key, imageUrl: imageDate.url } : {}),
      },
      id,
    );

    if (dto.amountPerDay || dto.duration || dto.firstDoseDate || dto.firstDoseTime) {
      await this.doseService.regenerateDoses(id);
    }
    return {
      updatedMediction,
      message: 'medication updated Successfully',
    };
  }

  async deleteMedication(id: string) {
    const medication = await this.getOne(id);
    if (medication && medication.status === MedicationStatus.ACTIVE) {
      return this.medicationRepo.deleteMedication(id);
    } else {
      throw new BadRequestException("you can't delete unActive Medication");
    }
  }
}
