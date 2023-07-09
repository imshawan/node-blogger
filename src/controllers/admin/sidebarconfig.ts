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
    icon: "icon-screen-desktop",
    title: "Categories",
    classes: "",
    menu: menus.MANAGE,
    child: [
      {
        url: "/admin/categories",
        id: "all_categories",
        icon: "icon-screen-desktop",
        title: "All",
        classes: "",
        menu: menus.MANAGE,
      },
      {
        url: "/admin/categories/create",
        id: "new_category",
        icon: "icon-screen-desktop",
        title: "New category",
        classes: "",
        menu: menus.MANAGE,
      },
    ],
  },
  {
    url: "",
    id: "users",
    icon: "icon-screen-desktop",
    title: "Users",
    classes: "",
    menu: menus.MANAGE,
    child: [
      {
        url: "/admin/users",
        id: "all_users",
        icon: "icon-screen-desktop",
        title: "All",
        classes: "",
        menu: menus.MANAGE,
      },
      {
        url: "/admin/users/create",
        id: "new_user",
        icon: "icon-screen-desktop",
        title: "New category",
        classes: "",
        menu: menus.MANAGE,
      },
    ],
  },
];
