import create from './create';
import utilities from './utils';
import data from './data';
import deleteCategory from './remove';
import update from './update';
import tags from './tags';

export default {
    create, utilities, data, deleteCategory, update, tags,
} as const;