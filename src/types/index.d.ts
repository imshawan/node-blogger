import { Express } from 'express';

export * from './database';
export * from './authentication';
export * from './application';
export * from './category';
export * from './user';
export * from './test';
export * from './webmanifest';
export * from './email';

export interface MutableObject { [x: string]: any; }

export type ValueOf<T> = T[keyof T];
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
    icon?: string
    data?: Array<ISidebar>
    title: string
    id?: any
}

export interface MulterFilesArray extends Express.Multer.File {
    url: string
}

export interface ExpressUser extends Express.User {
    userid: number
}

export interface IPagination {
    data: any[];
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
    navigation: {
        current: string;
        next: string | null;
        previous: string | null;
    };
    start: number;
    end: number;
}