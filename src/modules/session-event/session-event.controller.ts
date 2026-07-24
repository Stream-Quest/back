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
import {
  GetSessionEventListRoute,
  GetSessionEventDetailsRoute,
  CreateSessionEventRoute,
  UpdateSessionEventRoute,
  RejectSessionEventRoute,
  DeleteSessionEventRoute,
  ValidateSessionEventRoute,
} from './decorator/session-event-routes.decorator';
import { SessionEventQueryDto } from './dto/session-event-query.dto';
import { PaginationResponseDto } from '../../dto/pagination-response.dto';
import {
  DetailedSessionEventResponseDto,
  SessionEventResponseDto,
} from './dto/session-event-response.dto';
import { SessionEventService } from './session-event.service';
import { CreateSessionEventDto } from './dto/create-session-event.dto';
import { UpdateSessionEventDto } from './dto/update-session-event.dto';
import { SessionEventContext } from './decorator/session-event.decorator';
import type { SessionEvent } from '../../generated/prisma/client';
import { ValidateSessionEventDto } from './dto/validate-session-event.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Session Event')
@Controller('session')
export class SessionEventController {
  constructor(private readonly sessionEventService: SessionEventService) {}

  @Get(':id/event')
  @GetSessionEventListRoute('Get session event list')
  async getSessionEventList(
    @Param('id') sessionId: string,
    @Query() queryDto: SessionEventQueryDto,
  ): Promise<PaginationResponseDto<SessionEventResponseDto>> {
    return await this.sessionEventService.getSessionEventList(
      sessionId,
      queryDto,
    );
  }

  @Get(':id/event/:sessionEventId')
  @GetSessionEventDetailsRoute('Get session event details')
  async getSessionEvent(
    @Param('sessionEventId') sessionEventId: string,
  ): Promise<DetailedSessionEventResponseDto> {
    return await this.sessionEventService.getSessionEvent(sessionEventId);
  }

  @Post(':id/event')
  @CreateSessionEventRoute('Create a session event')
  async createSessionEvent(
    @Param('id') sessionId: string,
    @Body() createDto: CreateSessionEventDto,
  ): Promise<SessionEventResponseDto> {
    return await this.sessionEventService.createSessionEvent(
      createDto,
      sessionId,
    );
  }

  @Patch(':id/event/:sessionEventId')
  @UpdateSessionEventRoute('Update a session event')
  async updateSessionEvent(
    @Body() updateDto: UpdateSessionEventDto,
    @SessionEventContext() sessionEvent: SessionEvent,
  ): Promise<SessionEventResponseDto> {
    return await this.sessionEventService.updateSessionEvent(
      updateDto,
      sessionEvent,
    );
  }

  @Patch(':id/event/:sessionEventId/validate')
  @ValidateSessionEventRoute('Validate a session event')
  async validateSessionEvent(
    @Body() validateDto: ValidateSessionEventDto,
    @SessionEventContext() sessionEvent: SessionEvent,
  ): Promise<SessionEventResponseDto> {
    return await this.sessionEventService.validateSessionEvent(
      validateDto,
      sessionEvent,
    );
  }

  @Patch(':id/event/:sessionEventId/reject')
  @RejectSessionEventRoute('Reject a session event')
  async rejectSessionEvent(
    @SessionEventContext() sessionEvent: SessionEvent,
  ): Promise<SessionEventResponseDto> {
    return await this.sessionEventService.rejectSessionEvent(sessionEvent);
  }

  @Delete(':id/event/:sessionEventId')
  @DeleteSessionEventRoute('Delete a session event')
  async deleteSessionEvent(
    @SessionEventContext() sessionEvent: SessionEvent,
  ): Promise<SessionEvent> {
    return await this.sessionEventService.deleteSessionEvent(sessionEvent);
  }
}
