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
import { SessionService } from './session.service';
import {
  GetSessionListRoute,
  GetSessionDetailsRoute,
  CreateSessionRoute,
  UpdateSessionRoute,
  UpdateSessionStatusRoute,
  StartSessionRoute,
  GetContextSnapshotsRoute,
  UpdateContextSnapshotRoute,
  DeleteSessionRoute,
  GetSessionEventListRoute,
  GetSessionEventDetailsRoute,
  CreateSessionEventRoute,
  UpdateSessionEventRoute,
  RejectSessionEventRoute,
  DeleteSessionEventRoute,
  ValidateSessionEventRoute,
} from './decorator/session-routes.decorator';
import { SessionQueryDto } from './dto/session-query.dto';
import { PaginationResponseDto } from '../../dto/pagination-response.dto';
import { SessionResponseDto } from './dto/session-response.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import type {
  ContextSnapshot,
  Session,
  SessionEvent,
} from '../../generated/prisma/client';
import { SessionContext } from './decorator/session.decorator';
import { UpdateSessionStatusDto } from './dto/update-status.dto';
import { UpdateContextSnapshotDto } from './dto/update-context.dto';
import { SessionEventQueryDto } from '../session-event/dto/session-event-query.dto';
import {
  DetailedSessionEventResponseDto,
  SessionEventResponseDto,
} from '../session-event/dto/session-event-response.dto';
import { SessionEventService } from '../session-event/session-event.service';
import { CreateSessionEventDto } from '../session-event/dto/create-session-event.dto';
import { UpdateSessionEventDto } from '../session-event/dto/update-session-event.dto';
import { SessionEventContext } from '../session-event/decorator/session-event.decorator';
import { ValidateSessionEventDto } from '../session-event/dto/validate-session-event.dto';

@ApiTags('Session')
@Controller('session')
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly sessionEventService: SessionEventService,
  ) {}

  @Get('')
  @GetSessionListRoute('Get sessions')
  async sessionList(
    @Query() filterDto: SessionQueryDto,
  ): Promise<PaginationResponseDto<SessionResponseDto>> {
    return await this.sessionService.getSessionList(filterDto);
  }

  @Get(':id')
  @GetSessionDetailsRoute("Get a session's details")
  async sessionDetails(
    @Param('id') sessionId: string,
  ): Promise<SessionResponseDto> {
    return await this.sessionService.getSession(sessionId);
  }

  @Post('')
  @CreateSessionRoute('Create a session')
  async createSession(
    @Body() createDto: CreateSessionDto,
  ): Promise<SessionResponseDto> {
    return await this.sessionService.createSession(createDto);
  }

  @Patch(':id')
  @UpdateSessionRoute('Update a session')
  async updateSession(
    @Body() updateDto: UpdateSessionDto,
    @SessionContext() session: Session,
  ): Promise<SessionResponseDto> {
    return await this.sessionService.updateSession(updateDto, session);
  }

  @Patch(':id/status')
  @UpdateSessionStatusRoute("Update a session's status")
  async updateSessionStatus(
    @Body() updateDto: UpdateSessionStatusDto,
    @SessionContext() session: Session,
  ): Promise<SessionResponseDto> {
    return await this.sessionService.updateSessionStatus(updateDto, session);
  }

  @Patch(':id/start')
  @StartSessionRoute('Start a session')
  async startSession(
    @SessionContext() session: Session,
  ): Promise<SessionResponseDto> {
    return await this.sessionService.startSession(session);
  }

  @Patch(':id/end')
  @StartSessionRoute('End a session')
  async endSession(
    @SessionContext() session: Session,
  ): Promise<SessionResponseDto> {
    return await this.sessionService.endSession(session);
  }

  @Get(':id/snapshot')
  @GetContextSnapshotsRoute('Get session context snapshots')
  async getContextSnapshots(
    @SessionContext() session: Session,
  ): Promise<ContextSnapshot[]> {
    return await this.sessionService.getContextSnapshots(session);
  }

  @Patch(':id/snapshot')
  @UpdateContextSnapshotRoute('Take a snapshot of the session')
  async updateContextSnapshot(
    @Body() updateContextSnapshotDto: UpdateContextSnapshotDto,
    @SessionContext() session: Session,
  ): Promise<void> {
    await this.sessionService.updateContextSnapshot(
      updateContextSnapshotDto,
      session,
    );
  }

  @Delete(':id')
  @DeleteSessionRoute('Delete a session')
  async deleteSession(@SessionContext() session: Session): Promise<Session> {
    return await this.sessionService.deleteSession(session);
  }

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
