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