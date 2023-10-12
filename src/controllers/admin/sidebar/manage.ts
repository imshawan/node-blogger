import menus from "./menus"

export default [
    {
      url: "/admin/categories",
      id: "manage:all-categories",
      icon: "bi bi-list-nested",
      title: "Categories",
      classes: "",
      menu: menus.MANAGE,
      child: [],
    },
    {
      url: "`/admin/users",
      id: "manage:users",
      icon: "bi bi-person-fill",
      title: "Users",
      classes: "",
      menu: menus.MANAGE,
      child: [],
    },
] 