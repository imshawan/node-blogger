import { NextFunction, Request, Response } from "express";
import { MutableObject } from "@src/types";
import {data as sidebarData} from "./sidebar";
import { SideBar } from "@src/utilities";

const admin: MutableObject = {}

admin.get = async function get(req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};

    pageData.title = 'Admin';
    pageData.sidebar = {...sidebar.get('index'), ...{isDashboard: true}};
    res.render('index', pageData);
    
}

export {admin};