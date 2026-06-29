import {
  Campaign,
  CampaignEvent,
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

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadInterface;
      campaign?: Campaign;
      session?: Session;
      weather?: Weather;
      location?: Location;
      playerCharacter?: PlayerCharacter;
      eventType?: EventType;
      event?: Event;
      rule?: Rule;
      resolution?: Resolution;
      campaignEvent?: CampaignEvent;
    }
  }
}
