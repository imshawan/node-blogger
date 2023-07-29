import { Express } from 'express';

export * from './database';
export * from './authentication';
export * from './meta';
export * from './category';
export * from './user';

export interface MutableObject { [x: string]: any; }
export interface ISidebar {
    url: string
    icon: string
    id: string
    title: string
    classes: string
    menu: ISidebarMenu
    child?: Array<ISidebar>
    elementid?: string;
}

export interface ISidebarMenu {
    title: string
    id: any
}

export interface MulterFilesArray extends Express.Multer.File {
    url: string
}

export interface ExpressUser extends Express.User {
    userid: number
}