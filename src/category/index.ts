import create from './create';
import utilities from './utils';
import data from './data';
import deleteCategory from './remove';
import update from './update';
import tags from './tags';
import user from './user';

export default {
    create, utilities, data, deleteCategory, update, tags, user,
} as const;