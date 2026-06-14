import {
  Campaign,
  Location,
  PlayerCharacter,
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
    }
  }
}
