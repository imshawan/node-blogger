import { ISidebar, ISidebarMenu } from "@src/types";

export const menus = {
    DASHBOARD: {title: 'Dashboard', id: 1},
    MANAGE: {title: 'Manage', id: 2, icon: 'bi bi-menu-button-wide'},
}

export const data: Array<ISidebar> = [
  {
    url: "/admin/categories",
    id: "all_categories",
    icon: "bi bi-list-nested",
    title: "Categories",
    classes: "",
    menu: menus.MANAGE,
    child: [],
  },
  {
    url: "/admin/users",
    id: "users",
    icon: "bi bi-person-fill",
    title: "Users",
    classes: "",
    menu: menus.MANAGE,
    child: []
  },
];
