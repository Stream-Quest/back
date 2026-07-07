import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { EventTypeService } from './event-type.service';
import { EventTypeQueryDto } from './dto/event-type-query.dto';
import { PaginationResponseDto } from '../../dto/pagination-response.dto';
import { EventTypeResponseDto } from './dto/event-type-response.dto';
import { CreateEventTypeDto } from './dto/create-event-type.dto';
import { UpdateEventTypeDto } from './dto/update-event-type.dto';
import type { EventType } from '../../generated/prisma/client';
import { EventTypeContext } from './decorator/event-type.decorator';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateEventTypeRoute,
  DeleteEventTypeRoute,
  GetEventTypeDetailsRoute,
  GetEventTypeListRoute,
  UpdateEventTypeRoute,
} from './decorator/event-type-routes.decorator';
import { UserContext } from '../../decorators/user.decorator';
import type { JwtPayloadInterface } from '../../auth/interface/auth.interface';

@ApiTags('Event Type')
@Controller('event-type')
export class EventTypeController {
  constructor(private readonly eventTypeService: EventTypeService) {}

  @Get('')
  @GetEventTypeListRoute('Get event types')
  async eventTypeList(
    @Query() filterDto: EventTypeQueryDto,
  ): Promise<PaginationResponseDto<EventTypeResponseDto>> {
    return await this.eventTypeService.getEventTypeList(filterDto);
  }

  @Get(':id')
  @GetEventTypeDetailsRoute("Get an event type's details")
  async eventTypeDetails(
    @Param('id') eventTypeId: string,
  ): Promise<EventTypeResponseDto> {
    return await this.eventTypeService.getEventType(eventTypeId);
  }

  @Post('')
  @CreateEventTypeRoute('Create an event type')
  async createEventType(
    @Body() createDto: CreateEventTypeDto,
    @UserContext() user: JwtPayloadInterface,
  ): Promise<EventTypeResponseDto> {
    return await this.eventTypeService.createEventType(createDto, user);
  }

  @Patch(':id')
  @UpdateEventTypeRoute('Update an event type')
  async updateEventType(
    @Body() updateDto: UpdateEventTypeDto,
    @EventTypeContext() event: EventType,
  ): Promise<EventTypeResponseDto> {
    return await this.eventTypeService.updateEventType(updateDto, event);
  }

  @Delete(':id')
  @DeleteEventTypeRoute('Delete an event type')
  async deleteEventType(
    @EventTypeContext() eventType: EventType,
  ): Promise<EventTypeResponseDto> {
    return await this.eventTypeService.deleteEventType(eventType);
  }
}
