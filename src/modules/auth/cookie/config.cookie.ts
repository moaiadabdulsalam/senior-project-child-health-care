import { CookieOptions, Response } from 'express';

export const REFRESH_TOKEN_NAME = 'refreshToken';

export const getRefreshCookie = (): CookieOptions => ({
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/auth/refresh-token',
});

export const getClearRefreshCookieOption = (): CookieOptions => ({
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  path: '/auth/refresh-token',
});
