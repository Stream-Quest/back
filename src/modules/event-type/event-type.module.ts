import { Module } from '@nestjs/common';
import { EventTypeController } from './event-type.controller';
import { EventTypeService } from './event-type.service';
import { EventTypeRepository } from './event-type.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [EventTypeController],
  providers: [EventTypeService, EventTypeRepository],
})
export class EventTypeModule {}
