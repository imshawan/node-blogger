import { NextFunction, Request, Response } from "express";

const BASE = '/categories';
const create = async function create(req:Request, res: Response, next: NextFunction) {
    const pageData = {
        title: 'Categories'
    }
    res.render(BASE + '/create', pageData);
}


const categories = {
    create
};

export {categories};