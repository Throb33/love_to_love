import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {prisma} from './prisma';

export const SESSION_COOKIE = 'love_to_love_session';
export const ADMIN_PHONE = '19999999999';

export const getSessionUserId = async () => {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
};

export const getCurrentUser = async () => {
  const userId = await getSessionUserId();

  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: {id: userId},
    include: {profile: true, preferences: true, settings: true, profilePhotos: true},
  });
};

export const requireUser = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return user;
};

export const requireApprovedUser = async () => {
  const user = await requireUser();

  if (user.status !== 'APPROVED') {
    redirect(statusPath(user.status));
  }

  return user;
};

export const requireAdmin = async () => {
  const user = await requireUser();

  if (user.role !== 'ADMIN') {
    redirect('/');
  }

  return user;
};

export const statusPath = (status: string) => {
  if (status === 'DRAFT') {
    return '/profile/setup';
  }
  if (status === 'PENDING_REVIEW') {
    return '/profile/reviewing';
  }
  if (status === 'REJECTED') {
    return '/profile/rejected';
  }
  if (status === 'BANNED') {
    return '/banned';
  }
  return '/matches/recommendations';
};
