import { NextFunction, Request, Response } from "express";
import category from "@src/category";
import { MutableObject } from "@src/types";
import { SideBar } from "@src/utilities";
import {data as sidebarData} from "./sidebarconfig";

const BASE = 'categories';
const categories: MutableObject = {}

categories.get = async function get(req: Request, res: Response, next: NextFunction) {
    const pageData: MutableObject = {};
    const sidebar = new SideBar(sidebarData);

    pageData.title = 'Categories';
    pageData.sidebar = sidebar.get('all_categories');

    pageData.categories = await category.data.getCategories();
    
    res.render(BASE + '/list', pageData);
}

categories.getBySlug = async function get(req: Request, res: Response, next: NextFunction) {
    const pageData: MutableObject = {};
    const sidebar = new SideBar(sidebarData);
    const {cid, slug} = req.params;

    pageData.title = 'Categories';
    pageData.sidebar = sidebar.get('all_categories');

    pageData.category = await category.data.getCategoryBySlug([cid, slug].join('/'));

    return res.render(BASE + '/edit', pageData);
}

categories.create = async function create(req: Request, res: Response, next: NextFunction) {
    const pageData: MutableObject = {};
    const sidebar = new SideBar(sidebarData);

    pageData.title = 'New category';
    pageData.sidebar = sidebar.get('new_category');
    
    res.render(BASE + '/create', pageData);
}


export {categories};