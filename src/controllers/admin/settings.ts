import { NextFunction, Request, Response } from "express";
import { MetaKeysArray, MutableObject } from "@src/types";
import {data as sidebarData} from "./sidebar";
import { SideBar } from "@src/utilities";
import { getUsersByPagination } from "@src/user";
import { meta } from "@src/meta";

const BASE = 'settings';

const site = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};
    const siteMetaKeysArray: MetaKeysArray = [
        "siteName",
        "siteShortName",
        "description",
        "logo",
        "favicon",
        "altLogoText",
        "logoRedirectionUrl"
    ];

    pageData.title = 'Site settings';
    pageData.sidebar = sidebar.get('settings:site');
    pageData.data = retriveMetaPropertiesFiltered(siteMetaKeysArray);

    res.render(BASE + '/site/index', pageData);
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

function retriveMetaPropertiesFiltered(filterKeys: MetaKeysArray) {
    const metaObject: MutableObject = {};
    const {configurationStore} = meta;

    if (!configurationStore) return metaObject;

    if (filterKeys && filterKeys.length) {
        filterKeys.forEach(key => {
            if (Object.hasOwnProperty.bind(configurationStore)(key)) {
                metaObject[key] = configurationStore[key];
            } else {
                metaObject[key] = null;
            }
        });
    }

    return metaObject;
}

export default {
    site, blog, users, categories, posts, uploads, emails, notifications, webAndSeo, cookies
} as const;