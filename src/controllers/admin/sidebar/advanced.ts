import menus from "./menus"

export default [
    {
      url: "/admin/advanced/database",
      id: "advanced:database",
      icon: "bi bi-database",
      title: "Database",
      classes: "",
      menu: menus.ADVANCED,
      child: [],
    },
    {
      url: "/admin/advanced/custom-content",
      id: "advanced:custom-content",
      icon: "bi bi-file-earmark-code",
      title: "custom CSS/JS",
      classes: "",
      menu: menus.ADVANCED,
      child: [],
    },
] 