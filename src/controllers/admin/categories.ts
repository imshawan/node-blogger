import { NextFunction, Request, Response } from "express";
import category from "@src/category";
import { MutableObject } from "@src/types";

const BASE = '/categories';
const categories: MutableObject = {}

categories.get = async function get(req: Request, res: Response, next: NextFunction) {
    const pageData: MutableObject = {};

    pageData.title = 'Categories';
    pageData.categories = await category.data.getCategories();
    
    res.render(BASE + '/list', pageData);
}

categories.create = async function create(req: Request, res: Response, next: NextFunction) {
    const pageData = {
        title: 'New category'
    }
    
    res.render(BASE + '/manage', pageData);
}


export {categories};