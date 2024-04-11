import { NextFunction, Request, Response } from "express";
import { MutableObject } from "@src/types";
import {data as sidebarData} from "./sidebar";
import { SideBar } from "@src/utilities";
import * as Helpers from "@src/helpers";
import { getUsers } from "@src/user";
import menus from "./sidebar/menus";

const users: MutableObject = {}
const BASE = 'users'

users.get = async function get(req: Request, res: Response, next: NextFunction) {
    const query = req.query;
    let perPage = Number(query.perPage);
    let page = Number(query.page);

    if (!perPage) {
        perPage = 15;
    }
    if (isNaN(page) || !page) {
        page = 1;
    }

    const data = await getUsers({ perPage, page });
    const totalPages = Math.ceil(data.total / perPage);

    const sidebar = new SideBar(sidebarData, menus);
    const pageData: MutableObject = {};

    pageData.title = 'Users';
    pageData.sidebar = sidebar.get('manage:users');
    pageData.menus = sidebar.getMenu();
    pageData.users = data.users;
    pageData.pagination = Helpers.generatePaginationItems(req.url, page, totalPages)

    res.render(BASE + '/index', pageData);
}

export {users};