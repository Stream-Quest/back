import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { EventRepository } from './event.repository';
import { RuleService } from '../rule/rule.service';
import { RuleRepository } from '../rule/rule.repository';
import { ResolutionService } from '../resolution/resolution.service';
import { ResolutionRepository } from '../resolution/resolution.repository';
import { EventGuard } from './guard/event.guard';
import { RuleGuard } from '../rule/guard/rule.guard';
import { ResolutionGuard } from '../resolution/guard/resolution.guard';
import { EventTypeRepository } from '../event-type/event-type.repository';

@Module({
  imports: [PrismaModule],
  controllers: [EventController],
  providers: [
    EventService,
    EventRepository,
    RuleService,
    RuleRepository,
    ResolutionService,
    ResolutionRepository,
    EventGuard,
    RuleGuard,
    ResolutionGuard,
    EventTypeRepository,
  ],
})
export class EventModule {}
