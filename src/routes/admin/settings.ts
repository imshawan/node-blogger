import { Router } from 'express';
import controllers from '../../controllers';
import { mountAdminPageRoute } from '@src/helpers';

const router = Router();

mountAdminPageRoute(router, '/site', [], controllers.administrator.settings.site);
mountAdminPageRoute(router, '/blog', [], controllers.administrator.settings.blog);
mountAdminPageRoute(router, '/users', [], controllers.administrator.settings.users);
mountAdminPageRoute(router, '/categories', [], controllers.administrator.settings.categories);
mountAdminPageRoute(router, '/posts', [], controllers.administrator.settings.posts);
mountAdminPageRoute(router, '/file-uploads', [], controllers.administrator.settings.uploads);
mountAdminPageRoute(router, '/emails', [], controllers.administrator.settings.emails);
mountAdminPageRoute(router, '/notifications', [], controllers.administrator.settings.notifications);
mountAdminPageRoute(router, '/web-and-seo', [], controllers.administrator.settings.webAndSeo);
mountAdminPageRoute(router, '/cookies', [], controllers.administrator.settings.cookies);

export default router;