import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SessionStreamerResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'SessionStreamer unique identifier',
  })
  id: string;

  @ApiProperty({ example: true, description: 'Can view events overlay' })
  canViewEvents: boolean;

  @ApiProperty({ example: true, description: 'Can view karma overlay' })
  canViewKarma: boolean;

  @ApiProperty({ example: true, description: 'Can view milestones overlay' })
  canViewMilestones: boolean;

  @ApiProperty({ example: true, description: 'Can view context overlay' })
  canViewContext: boolean;

  @ApiProperty({ example: false, description: 'Can view players overlay' })
  canViewPlayers: boolean;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Session UUID (foreign key)',
  })
  sessionId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User UUID (foreign key)',
  })
  userId: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Assigned PlayerCharacter UUID',
  })
  playerCharacterId: string | null;

  @ApiProperty({ example: '2026-07-09T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-09T10:00:00.000Z' })
  updatedAt: Date;
}

export class DetailedSessionStreamerResponseDto extends SessionStreamerResponseDto {
  @ApiProperty({
    description: 'User details',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'maengdok_',
      avatarUrl: null,
      twitchId: '123',
    },
  })
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
    twitchId: string;
  };
}

export class InviteLinkResponseDto {
  @ApiProperty({
    example:
      'http://localhost:3000/invite/550e8400-e29b-41d4-a716-446655440000',
    description: 'Invitation link for the streamer',
  })
  inviteUrl: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Session UUID used as invite token',
  })
  sessionId: string;
}

export class InviteInfoResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  sessionId: string;

  @ApiProperty({ example: 'Session #12' })
  sessionTitle: string;

  @ApiProperty({ example: 'The Lost Chronicles' })
  campaignTitle: string;

  @ApiProperty({ example: 'maengdok_' })
  gmUsername: string;
}
