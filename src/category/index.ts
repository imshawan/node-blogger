import create from './create';
import utilities from './utils';
import data from './data';
import deleteCategory from './remove';
import update from './update';
import tags from './tags';
import user from './user';
import post from './post';

export default {
    create, utilities, data, deleteCategory, update, tags, user, post
} as const;