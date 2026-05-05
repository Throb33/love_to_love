import {json, requireApiApprovedUser} from '@/lib/api';
import {getRecommendations, type RecommendationFilters} from '@/lib/matching';

const parseFilters = (value: Record<string, unknown>): RecommendationFilters => ({
  minAge: value.minAge ? Number(value.minAge) : undefined,
  maxAge: value.maxAge ? Number(value.maxAge) : undefined,
  city: String(value.city ?? '').trim() || undefined,
  education: String(value.education ?? '').trim() || undefined,
  minHeightCm: value.minHeightCm ? Number(value.minHeightCm) : undefined,
});

export async function GET(request: Request) {
  const {user, response} = await requireApiApprovedUser();

  if (response) {
    return response;
  }

  const url = new URL(request.url);
  const recommendations = await getRecommendations(user.id, {
    minAge: url.searchParams.get('minAge') ? Number(url.searchParams.get('minAge')) : undefined,
    maxAge: url.searchParams.get('maxAge') ? Number(url.searchParams.get('maxAge')) : undefined,
    city: url.searchParams.get('city')?.trim() || undefined,
    education: url.searchParams.get('education')?.trim() || undefined,
    minHeightCm: url.searchParams.get('minHeightCm')
      ? Number(url.searchParams.get('minHeightCm'))
      : undefined,
  });

  return json({recommendations});
}

export async function POST(request: Request) {
  const {user, response} = await requireApiApprovedUser();

  if (response) {
    return response;
  }

  const body = await request.json().catch(() => ({}));
  const recommendations = await getRecommendations(user.id, parseFilters(body));
  return json({recommendations});
}
