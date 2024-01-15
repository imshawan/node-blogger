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