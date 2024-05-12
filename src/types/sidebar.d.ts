/*
 * Copyright (C) 2023 Shawan Mandal <github@imshawan.dev>.
 *
 * Licensed under the GNU General Public License v3, 29 June 2007
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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