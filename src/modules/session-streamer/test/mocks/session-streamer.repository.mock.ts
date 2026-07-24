import {
  createMockSessionStreamer,
  createMockSessionStreamerWithUser,
  createMockSessionWithCampaign,
} from '../fixtures/session-streamer.fixture';

export const createMockSessionStreamerRepository = () => ({
  getSessionStreamerList: jest
    .fn()
    .mockResolvedValue([createMockSessionStreamerWithUser()]),
  getSessionStreamer: jest.fn().mockResolvedValue(createMockSessionStreamer()),
  getSessionStreamerByUserAndSession: jest.fn().mockResolvedValue(null),
  getSessionWithCampaign: jest
    .fn()
    .mockResolvedValue(createMockSessionWithCampaign()),
  createSessionStreamer: jest
    .fn()
    .mockResolvedValue(createMockSessionStreamer()),
  updateSessionStreamer: jest
    .fn()
    .mockResolvedValue(createMockSessionStreamer()),
  deleteSessionStreamer: jest
    .fn()
    .mockResolvedValue(createMockSessionStreamer()),
  getUserOverlayToken: jest
    .fn()
    .mockResolvedValue({ overlayToken: 'overlay-token-123' }),
});
