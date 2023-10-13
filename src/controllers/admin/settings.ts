import { NextFunction, Request, Response } from "express";
import { MutableObject } from "@src/types";
import {data as sidebarData} from "./sidebar";
import { SideBar } from "@src/utilities";
import { getUsersByPagination } from "@src/user";

const BASE = 'settings';

const site = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};

    pageData.title = 'Site settings';
    pageData.sidebar = sidebar.get('settings:site');

    res.render(BASE + '/site', pageData);
}

const blog = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};

    pageData.title = 'Blog settings';
    pageData.sidebar = sidebar.get('settings:blog');

    res.render(BASE + '/blog', pageData);
}

const users = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};

    pageData.title = 'Users';
    pageData.sidebar = sidebar.get('settings:users');

    res.render(BASE + '/users', pageData);
}

const categories = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};

    pageData.title = 'Category settings';
    pageData.sidebar = sidebar.get('settings:categories');

    res.render(BASE + '/categories', pageData);
}


const posts = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};

    pageData.title = 'Posts settings';
    pageData.sidebar = sidebar.get('settings:posts');

    res.render(BASE + '/posts', pageData);
}


const uploads = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};

    pageData.title = 'File Uploads';
    pageData.sidebar = sidebar.get('settings:file-uploads');

    res.render(BASE + '/uploads', pageData);
}

const emails = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};

    pageData.title = 'Emails';
    pageData.sidebar = sidebar.get('settings:emails');

    res.render(BASE + '/emails', pageData);
}

const notifications = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};

    pageData.title = 'Notifications';
    pageData.sidebar = sidebar.get('settings:notifications');

    res.render(BASE + '/notifications', pageData);
}

const webAndSeo = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};

    pageData.title = 'Web & SEO preferences';
    pageData.sidebar = sidebar.get('settings:web-and-seo');

    res.render(BASE + '/web-and-seo', pageData);
}

const cookies = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};

    pageData.title = 'Cookies';
    pageData.sidebar = sidebar.get('settings:cookies');

    res.render(BASE + '/cookies', pageData);
}

export default {
    site, blog, users, categories, posts, uploads, emails, notifications, webAndSeo, cookies
} as const;