import serverlessHttp from 'serverless-http';
import app from '../src/server.js';

export const handler = serverlessHttp(app);

