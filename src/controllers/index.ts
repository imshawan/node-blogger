import blog from './blog';
import api from './api';
import authentication from './authentication';
import administrator from './admin';
import users from './user';
import web from './web';

export default {
  blog, api, authentication, administrator, users, web
} as const;