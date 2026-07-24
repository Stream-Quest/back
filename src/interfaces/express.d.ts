import {
  Campaign,
  CampaignEvent,
  CampaignThresholdEvent,
  Event,
  EventType,
  KarmaEvent,
  Location,
  PlayerCharacter,
  Resolution,
  Rule,
  Session,
  SessionEvent,
  SessionPlayerCharacter,
  SessionStreamer,
  TwitchEventMapping,
  User,
  Weather,
} from '../generated/prisma/client';
import { JwtPayloadInterface } from '../modules/auth/interface/auth.interface';

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
      sessionEvent?: SessionEvent;
      karmaEvent?: KarmaEvent;
      thresholdEvent?: CampaignThresholdEvent;
      twitchMapping?: TwitchEventMapping;
      sessionStreamer?: SessionStreamer;
      sessionPlayerCharacter?: SessionPlayerCharacter;
      overlayContext?: {
        user: User;
        sessionStreamer: SessionStreamer;
      };
    }
  }
}
