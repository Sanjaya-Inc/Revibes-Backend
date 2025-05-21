import { authenticate } from '../../middlewares/auth';
import { signup, signupWithGoogle, login, loginWithGoogle, logout, refresh } from './auth';
import { RequestHandler } from 'express';

type RouteDefinition = [method: 'get' | 'post' | 'put' | 'delete', path: string, ...handlers: RequestHandler[]];

export const ROUTES: RouteDefinition[] = [
  ['post', '/auth/signup/email', signup],
  ['post', '/auth/signup/google', signupWithGoogle],
  ['post', '/auth/login/email', login],
  ['post', '/auth/login/google', loginWithGoogle],
  ['post', '/auth/logout', authenticate, logout],
  ['post', '/auth/refresh', refresh],
];

export default ROUTES;