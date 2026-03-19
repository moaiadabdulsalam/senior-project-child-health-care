import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import {
  getClearRefreshCookieOption,
  getRefreshCookie,
  REFRESH_TOKEN_NAME,
} from '../cookie/config.cookie';

@Injectable()
export class CookieService {
  setRefreshToken(res: Response, refreshToken: string) {
    res.cookie(REFRESH_TOKEN_NAME, refreshToken, getRefreshCookie());
  }

  clearRefreshToken(res: Response) {
    res.clearCookie(REFRESH_TOKEN_NAME, getClearRefreshCookieOption());
  }
}
