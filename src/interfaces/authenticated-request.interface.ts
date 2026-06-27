import {
  Campaign,
  Event,
  EventType,
  Location,
  PlayerCharacter,
  Resolution,
  Rule,
  Session,
  Weather,
} from '../generated/prisma/client';
import { JwtPayloadInterface } from '../auth/interface/auth.interface';

export interface AuthenticatedRequest extends Request {
  user: JwtPayloadInterface;
}

export interface AuthenticatedRequestWithCampaign extends AuthenticatedRequest {
  campaign: Campaign;
}

export interface AuthenticatedRequestWithSession extends AuthenticatedRequest {
  session: Session;
  campaign: Campaign;
}

export interface AuthenticatedRequestWithWeather extends AuthenticatedRequest {
  weather: Weather;
}

export interface AuthenticatedRequestWithLocation extends AuthenticatedRequest {
  location: Location;
}

export interface AuthenticatedRequestWithPlayerCharacter extends AuthenticatedRequest {
  playerCharacter: PlayerCharacter;
}

export interface AuthenticatedRequestWithEventType extends AuthenticatedRequest {
  eventType: EventType;
}

export interface AuthenticatedRequestWithEvent extends AuthenticatedRequest {
  event: Event;
}

export interface AuthenticatedRequestWithRule extends AuthenticatedRequest {
  rule: Rule;
}

export interface AuthenticatedRequestWithResolution extends AuthenticatedRequest {
  resolution: Resolution;
}
