import { NextFunction, Request, Response } from "express";
import { MutableObject } from "@src/types";
import {data as sidebarData} from "./sidebar";
import { SideBar } from "@src/utilities";
import { getUsersByPagination } from "@src/user";

const users: MutableObject = {}
const BASE = 'users'

users.get = async function get(req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};

    pageData.title = 'Users';
    pageData.sidebar = sidebar.get('users');
    pageData.users = await getUsersByPagination();

    res.render(BASE + '/index', pageData);
}

export {users};