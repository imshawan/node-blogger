import create from './create';
import utilities from './utils';
import data from './data';
import deleteCategory from './remove';
import update from './update';

export default {
    create, utilities, data, deleteCategory, update
} as const;