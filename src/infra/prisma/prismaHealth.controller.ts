import { PrismaService } from './prisma.service';
import {
  Controller,
  Get,
} from '@nestjs/common';

@Controller('health')
export class PrismaHealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('db-pool')
  getDbPool() {
    return this.prisma.getPoolStatus();
  }
}