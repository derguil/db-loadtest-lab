import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaHealthController } from './prismaHealth.controller';

@Module({
	controllers: [PrismaHealthController],
	providers: [PrismaService],
	exports: [PrismaService],
})
export class PrismaModule {}
