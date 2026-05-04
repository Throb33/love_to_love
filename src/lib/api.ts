import {NextResponse} from 'next/server';
import {getCurrentUser} from './auth';

export const json = (data: unknown, init?: ResponseInit) =>
  NextResponse.json(data, init);

export const unauthorized = () =>
  json({error: '请先登录'}, {status: 401});

export const forbidden = (message = '无权限访问') =>
  json({error: message}, {status: 403});

export const badRequest = (message: string) =>
  json({error: message}, {status: 400});

export const requireApiUser = async () => {
  const user = await getCurrentUser();
  return user;
};

export const requireApiApprovedUser = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return {user: null, response: unauthorized()};
  }

  if (user.status !== 'APPROVED') {
    return {user: null, response: forbidden('资料审核通过后才能使用该功能')};
  }

  return {user, response: null};
};

export const requireApiAdmin = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return {user: null, response: unauthorized()};
  }

  if (user.role !== 'ADMIN') {
    return {user: null, response: forbidden('需要管理员权限')};
  }

  return {user, response: null};
};
