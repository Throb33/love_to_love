import {json, requireApiApprovedUser} from '@/lib/api';
import {getRecommendations} from '@/lib/matching';

export async function GET() {
  const {user, response} = await requireApiApprovedUser();

  if (response) {
    return response;
  }

  const recommendations = await getRecommendations(user.id);
  return json({recommendations});
}
