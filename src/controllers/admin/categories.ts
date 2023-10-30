import { NextFunction, Request, Response } from "express";
import category from "@src/category";
import { ICategoryTag, MutableObject, ICategory } from "@src/types";
import { SideBar } from "@src/utilities";
import {data as sidebarData} from "./sidebar";
import _ from "lodash";
import { validatePaginationControls, ValueError } from "@src/helpers";
import { ValidSortingTechniques, ValidSortingTechniquesWithNames } from "@src/constants";

const BASE = 'categories';
const categories: MutableObject = {}

categories.get = async function get(req: Request, res: Response, next: NextFunction) {
    const pageData: MutableObject = {};
    const sidebar = new SideBar(sidebarData);
    const {sortBy, search} = req.query;
    const {perPage, page} = validatePaginationControls(req);
    let sortingLabel = '', categories: Array<any> = [];

    if (sortBy && typeof sortBy !== undefined) {
        if (!Object.keys(ValidSortingTechniques).includes(String(sortBy).toUpperCase())) {
           throw new ValueError('Invalid sorting type - ' + sortBy);
        }
        if (Object.keys(ValidSortingTechniquesWithNames).includes(String(sortBy).toUpperCase())) {
            // @ts-ignore
            sortingLabel = ValidSortingTechniquesWithNames[(String(sortBy).toUpperCase())];
        }
        
        pageData.sorting = {id: sortBy, label: sortingLabel};
    } else {
        pageData.sorting = {};
    }

    if (search && search.length) {
        categories = await category.data.getCategoryByName(String(search), perPage, page, [], String(sortBy));
    } else {
        categories = await category.data.getCategoriesWithData(perPage, page, [], String(sortBy));
    }

    pageData.title = 'Categories';
    pageData.sidebar = sidebar.get('manage:all-categories');

    pageData.categories = categories;
    pageData.search = search || '';
    
    res.render(BASE + '/list', pageData);
}

categories.getBySlug = async function get(req: Request, res: Response, next: NextFunction) {
    const pageData: MutableObject = {};
    const sidebar = new SideBar(sidebarData);
    const {cid, slug} = req.params;

    let categoryData: ICategory = {};

    if (cid && slug) {
        categoryData = await category.data.getCategoryBySlug([cid, slug].join('/'));
    } else if (cid) {
        categoryData = await category.data.getCategoryByCid(cid);
    }

    if (!categoryData) {
        throw new Error('No such category was found!')
    }

    const tags = await category.tags.getByCategoryId(Number(cid), ['name', 'tagid']);
    if (categoryData.parent) {
        categoryData.parent = await category.data.getCategoryByCid(categoryData.parent, ['cid', 'name', 'thumb']);
    }

    pageData.title = categoryData.name;
    pageData.sidebar = sidebar.get('manage:all-categories');

    pageData.category = categoryData;
    pageData.tags = (tags || []).map((tag: ICategoryTag) => ({id: tag.tagid, text: tag.name, selected: true}));

    return res.render(BASE + '/edit', pageData);
}

categories.create = async function create(req: Request, res: Response, next: NextFunction) {
    const pageData: MutableObject = {};
    const sidebar = new SideBar(sidebarData);

    pageData.title = 'New category';
    pageData.sidebar = sidebar.get('manage:all-categories');
    
    res.render(BASE + '/create', pageData);
}


export {categories};