export const createMockCampaignEventRepository = () => ({
  getCampaignEventList: jest.fn(),
  getCampaignEvent: jest.fn(),
  createCampaignEvent: jest.fn(),
  updateCampaignEvent: jest.fn(),
  deleteCampaignEvent: jest.fn(),
});
