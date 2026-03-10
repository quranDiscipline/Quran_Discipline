import { api } from '../../../lib/axios';
import type { LandingPageContent } from '../types/landing.types';

const landingApi = {
  getAllContent: async (): Promise<LandingPageContent> => {
    const response = await api.get('/public/landing-content');
    return response.data.data;
  },

  updateSection: async (
    section: string,
    contentJson: Record<string, any>,
  ): Promise<any> => {
    const response = await api.patch(`/admin/landing-page/content/${section}`, {
      contentJson,
    });
    return response.data.data;
  },
};

export { landingApi };
