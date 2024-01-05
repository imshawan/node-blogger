
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

export interface MenuItems {
    DASHBOARD: ISidebarMenuItem;
    MANAGE: ISidebarMenuItem;
    SETTINGS: ISidebarMenuItem;
    ADVANCED: ISidebarMenuItem;
}

export interface ISidebarMenuItem {
    title: string;
    id?: any;
    icon: string;
    url?: string;
    submenus?: boolean;
    classes?: string
}