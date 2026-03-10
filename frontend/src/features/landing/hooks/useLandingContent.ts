import { useQuery } from '@tanstack/react-query';
import { landingApi } from '../services/landing.service';

export const landingKeys = {
  all: ['landing'] as const,
  content: () => [...landingKeys.all, 'content'] as const,
};

export const useLandingContent = () => {
  return useQuery({
    queryKey: landingKeys.content(),
    queryFn: landingApi.getAllContent,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
