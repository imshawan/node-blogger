import { NextFunction, Request, Response } from "express";

const BASE = 'admin/categories';
const create = async function create(req:Request, res: Response, next: NextFunction) {
    res.render(BASE + '/create');
}


const categories = {
    create
};

export {categories};