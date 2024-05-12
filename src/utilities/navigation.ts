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

import _ from "lodash";

export const navigationItems = [
    { name: "Home", url: "/", id: "home"},
    { name: "Users", url: "/users", id: "users" },
    { name: "Categories", url: "/categories", id: "categories" },
    { name: "Posts", url: "/posts", id: "posts" },
    { name: "Contact", url: "/contact", id: "contact" },
    { name: "About", url: "/about", id: "about" }
  ]

export class NavigationManager {
    private readonly elements: ({ name: string; url: string; id: string; classes?: string; active?: boolean })[];
    constructor() {
        this.elements = navigationItems;
    }

    public get(id?: string | undefined, activeClasses?: string) {
        const elements = this.elements.map(element => {
            if (id && element.id == String(id).toLowerCase().trim()) {
                element.classes = activeClasses;
                element.active = true;
            } else {
                element.active = false;
            }

            return element;
        });

        return elements;
    }
}