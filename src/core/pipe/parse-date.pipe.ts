import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform {
  transform(value: string | Date): Date {
    if (value instanceof Date) return value;

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    return date;
  }
}