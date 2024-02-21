import { NextFunction, Request, Response } from "express";
import { MutableObject } from "@src/types";
import {data as sidebarData} from "./sidebar";
import { SideBar } from "@src/utilities";
import { getUsersByPagination } from "@src/user";
import menus from "./sidebar/menus";

const users: MutableObject = {}
const BASE = 'users'

users.get = async function get(req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData, menus);
    const pageData: MutableObject = {};

    pageData.title = 'Users';
    pageData.sidebar = sidebar.get('manage:users');
    pageData.menus = sidebar.getMenu();
    pageData.users = await getUsersByPagination();

    res.render(BASE + '/index', pageData);
}

export {users};