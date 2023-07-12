import { ISidebar, ISidebarMenu } from "@src/types";

export const menus = {
    DASHBOARD: {title: 'Dashboard', id: 1},
    MANAGE: {title: 'Manage', id: 2},
    DASH: {title: 'Dash', id: 2},
}

export const data: Array<ISidebar> = [
  {
    url: "/admin/dashboard",
    id: "index",
    icon: "icon-screen-desktop",
    title: "Dashboard",
    classes: "",
    menu: menus.DASHBOARD,
  },
  {
    url: "",
    id: "categories",
    icon: "icon-list",
    title: "Categories",
    classes: "",
    menu: menus.MANAGE,
    child: [
      {
        url: "/admin/categories",
        id: "all_categories",
        icon: "",
        title: "All",
        classes: "",
        menu: menus.MANAGE,
      },
      {
        url: "/admin/categories/create",
        id: "new_category",
        icon: "",
        title: "New category",
        classes: "",
        menu: menus.MANAGE,
      },
    ],
  },
  {
    url: "/admin/users",
    id: "users",
    icon: "icon-user",
    title: "Users",
    classes: "",
    menu: menus.MANAGE,
    child: []
  },
];
