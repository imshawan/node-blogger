import { NextFunction, Request, Response } from "express";
import { MutableObject } from "@src/types";
import { getConnectionInfo } from "@src/database";
import {data as sidebarData} from "./sidebar";
import { SideBar } from "@src/utilities";
import menus from "./sidebar/menus";

const BASE = 'advanced';

const databaseInfo = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData, menus);
    const pageData: MutableObject = {};

    pageData.title = 'Site settings';
    pageData.sidebar = sidebar.get('settings:site');
    pageData.menus = sidebar.getMenu();
    pageData.dbInfo = await getConnectionInfo();

    res.render(BASE + '/db/index', pageData);
}

export default {
    databaseInfo
} as const;