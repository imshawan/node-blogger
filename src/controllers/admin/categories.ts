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
    pageData.categories = await category.data.getCategories();
    pageData.sidebar = sidebar.get('all_categories');
    
    res.render(BASE + '/list', pageData);
}

categories.create = async function create(req: Request, res: Response, next: NextFunction) {
    const pageData: MutableObject = {};
    const sidebar = new SideBar(sidebarData);

    pageData.title = 'New category';
    pageData.sidebar = sidebar.get('new_category');
    
    res.render(BASE + '/manage', pageData);
}


export {categories};