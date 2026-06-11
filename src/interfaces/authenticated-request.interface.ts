import { Campaign, Session, Weather } from '../generated/prisma/client';
import { JwtPayloadInterface } from '../auth/interface/auth.interface';

export interface AuthenticatedRequest extends Request {
  user: JwtPayloadInterface;
}

export interface AuthenticatedRequestWithCampaign extends Request {
  user: JwtPayloadInterface;
  campaign: Campaign;
}

export interface AuthenticatedRequestWithSession extends Request {
  user: JwtPayloadInterface;
  session: Session;
  campaign: Campaign;
}

export interface AuthenticatedRequestWithWeather extends Request {
  user: JwtPayloadInterface;
  weather: Weather;
}
