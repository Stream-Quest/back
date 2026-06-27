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
import { ApiTags } from '@nestjs/swagger';
import { EventService } from './event.service';
import { ResolutionService } from './resolution.service';
import { RuleService } from './rule.service';
import { EventQueryDto } from './dto/event-query.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import {
  DetailedEventResponseDto,
  EventResponseDto,
} from './dto/event-response.dto';
import { EventContext } from './decorator/event.decorator';
import { UserContext } from '../decorators/user.decorator';
import type { Event, Resolution, Rule } from '../generated/prisma/client';
import type { JwtPayloadInterface } from '../auth/interface/auth.interface';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RuleResponseDto } from './dto/rule/rule-response.dto';
import { CreateRuleDto } from './dto/rule/create-rule.dto';
import { UpdateRuleDto } from './dto/rule/update-rule.dto';
import { RuleContext } from './decorator/rule.decorator';
import { ResolutionResponseDto } from './dto/resolution/resolution-response.dto';
import { CreateResolutionDto } from './dto/resolution/create-resolution.dto';
import { UpdateResolutionDto } from './dto/resolution/update-resolution.dto';
import { ResolutionContext } from './decorator/resolution.decorator';
import {
  CreateEventRoute,
  CreateResolutionRoute,
  CreateRuleRoute,
  DeleteEventRoute,
  DeleteResolutionRoute,
  DeleteRuleRoute,
  GetEventDetailsRoute,
  GetEventListRoute,
  GetResolutionRoute,
  GetRuleRoute,
  UpdateEventRoute,
  UpdateResolutionRoute,
  UpdateRuleRoute,
} from './decorator/event-routes.decorator';

@ApiTags('Event')
@Controller('event')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly ruleService: RuleService,
    private readonly resolutionService: ResolutionService,
  ) {}

  @Get('')
  @GetEventListRoute('Get event list')
  async eventList(
    @Query() filterDto: EventQueryDto,
    @UserContext() user: JwtPayloadInterface,
  ): Promise<PaginationResponseDto<EventResponseDto>> {
    return await this.eventService.getEventList(filterDto, user);
  }

  @Get(':id')
  @GetEventDetailsRoute('Get details of an event')
  async eventDetails(
    @Param('id') eventId: string,
  ): Promise<DetailedEventResponseDto> {
    return await this.eventService.getEvent(eventId);
  }

  @Post('')
  @CreateEventRoute('Create an event')
  async createEvent(
    @Body() createDto: CreateEventDto,
    @UserContext() user: JwtPayloadInterface,
  ): Promise<EventResponseDto> {
    return await this.eventService.createEvent(createDto, user);
  }

  @Patch(':id')
  @UpdateEventRoute('Update an event')
  async updateEvent(
    @Body() updateDto: UpdateEventDto,
    @EventContext() event: Event,
  ): Promise<EventResponseDto> {
    return await this.eventService.updateEvent(updateDto, event);
  }

  @Delete(':id')
  @DeleteEventRoute('Delete an event')
  async deleteEvent(@EventContext() event: Event): Promise<Event> {
    return await this.eventService.deleteEvent(event);
  }

  @Get(':id/rule/:ruleId')
  @GetRuleRoute('Get details of a rule')
  getRule(@RuleContext() rule: Rule): RuleResponseDto {
    return rule;
  }

  @Post(':id/rule')
  @CreateRuleRoute('Create a rule')
  async createRule(
    @Param('id') eventId: string,
    @Body() createDto: CreateRuleDto,
  ): Promise<RuleResponseDto> {
    return await this.ruleService.createRule(createDto, eventId);
  }

  @Patch(':id/rule/:ruleId')
  @UpdateRuleRoute('Update a rule')
  async updateRule(
    @Body() updateDto: UpdateRuleDto,
    @RuleContext() rule: Rule,
  ): Promise<RuleResponseDto> {
    return await this.ruleService.updateRule(updateDto, rule);
  }

  @Delete(':id/rule/:ruleId')
  @DeleteRuleRoute('Delete a rule')
  async deleteRule(@RuleContext() rule: Rule): Promise<Rule> {
    return await this.ruleService.deleteRule(rule);
  }

  @Get(':id/resolution/:resolutionId')
  @GetResolutionRoute('Get details of a resolution')
  async getResolution(
    @ResolutionContext() resolution: Resolution,
  ): Promise<ResolutionResponseDto> {
    return await this.resolutionService.getResolution(resolution.id);
  }

  @Post(':id/resolution')
  @CreateResolutionRoute('Create a resolution')
  async createResolution(
    @Param('id') eventId: string,
    @Body() createDto: CreateResolutionDto,
  ): Promise<ResolutionResponseDto> {
    return await this.resolutionService.createResolution(createDto, eventId);
  }

  @Patch(':id/resolution/:resolutionId')
  @UpdateResolutionRoute('Update a resolution')
  async updateResolution(
    @Body() updateDto: UpdateResolutionDto,
    @ResolutionContext() resolution: Resolution,
  ): Promise<ResolutionResponseDto> {
    return await this.resolutionService.updateResolution(updateDto, resolution);
  }

  @Delete(':id/resolution/:resolutionId')
  @DeleteResolutionRoute('Delete a resolution')
  async deleteResolution(
    @ResolutionContext() resolution: Resolution,
  ): Promise<Resolution> {
    return await this.resolutionService.deleteResolution(resolution);
  }
}
