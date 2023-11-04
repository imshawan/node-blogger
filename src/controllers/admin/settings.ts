import { NextFunction, Request, Response } from "express";
import { AppKeysArray, MutableObject } from "@src/types";
import {data as sidebarData} from "./sidebar";
import { SideBar } from "@src/utilities";
import { getUsersByPagination } from "@src/user";
import { application } from "@src/application";

const BASE = 'settings';
const sorting = {
    "Default": "default",
    "Most recent": "recent",
    "Oldest": "oldest",
    "Popularity": "popular",
    "More posts": "posts",
}

const site = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};
    const siteAppKeysArray: AppKeysArray = [
        "siteName",
        "siteNameUrl",
        "siteShortName",
        "description",
        "logo",
        "favicon",
        "altLogoText",
        "logoRedirectionUrl"
    ];

    pageData.title = 'Site settings';
    pageData.sidebar = sidebar.get('settings:site');
    pageData.data = retriveApplicationPropertiesFiltered(siteAppKeysArray);

    res.render(BASE + '/site/index', pageData);
}

const blog = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};

    pageData.title = 'Blog settings';
    pageData.sidebar = sidebar.get('settings:blog');
    pageData.data = {}
    pageData.sorting = sorting;

    res.render(BASE + '/blog/index', pageData);
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

function retriveApplicationPropertiesFiltered(filterKeys: AppKeysArray) {
    const applicationObject: MutableObject = {};
    const {configurationStore} = application;

    if (!configurationStore) return applicationObject;

    if (filterKeys && filterKeys.length) {
        filterKeys.forEach(key => {
            if (Object.hasOwnProperty.bind(configurationStore)(key)) {
                applicationObject[key] = configurationStore[key];
            } else {
                applicationObject[key] = null;
            }
        });
    }

    return applicationObject;
}

export default {
    site, blog, users, categories, posts, uploads, emails, notifications, webAndSeo, cookies
} as const;