import { Application } from 'express';
import { authRoutes } from './features/auth/routes/authRoutes';
import { serverAdapter } from '@service/queus/base.queue';
import { currentUserRoute } from './features/auth/routes/currentUser-route';
import { authMiddleware } from '@global/helpers/auth-middleware';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signoutRoute());
    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoute.routes());
  };
  routes();
};
