import _ from "lodash";
import { ISidebar, ISidebarMenuItem, MenuItems } from "@src/types";

export class SideBar {
    sidebar: Array<ISidebar> | undefined;
    menus: MenuItems | {} | undefined;
    constructor(sidebarData?: Array<ISidebar>, menus?: {}) {
        this.sidebar = sidebarData;
        this.menus = menus;

        this.get = this.get.bind(this);
        this.checkForDuplicateIds = this.checkForDuplicateIds.bind(this);
        this.groupDataByMenuId = this.groupDataByMenuId.bind(this);

        this.checkForDuplicateIds();
    }

    /**
     * @function checkForDuplicateIds
     * @description Validate and throw error incase of duplicate IDs
     */
    private checkForDuplicateIds(): void {
        const idSet = new Set<string>();
        const duplicateIds: string[] = [];
        const data: Array<ISidebar> | undefined = this.sidebar;

        if (!data) return;
      
        function validateSidebar(sidebar: ISidebar) {
            if (idSet.has(sidebar.id)) {
                duplicateIds.push(sidebar.id);
            } else {
                idSet.add(sidebar.id);
            }
        
            if (sidebar.child && sidebar.child.length) {
                sidebar.child.forEach(validateSidebar);
            }
        }
      
        data.forEach(validateSidebar);
      
        if (duplicateIds.length) {
            const duplicates = duplicateIds.filter(id => id && id.length && id != '')
            if (duplicates && duplicates.length) {
                throw new Error(`Found ${duplicateIds.length} element(s) with duplicated ids. (${duplicates.join(', ')})`);
            }
        }
    }

    private generateElementId(prefix: string, length: number = 12): string {
        const characters = 'abcdefghijklmnopqrstuvwxyz';
        let uniqueId = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            uniqueId += characters.charAt(randomIndex);
        }
        return [prefix, uniqueId].join('-');
    }

    /**
     * 
     * @function groupDataByMenuId
     * @description Group sidebar data by menu
     */
    private groupDataByMenuId(data: Array<ISidebar>): { [key: number]: Array<ISidebar> } {
        const groupedData: { [key: string]: any } = {};
        const generateElementId = this.generateElementId;

        function processSidebar(sidebar: ISidebar) {
            const menuTitle = sidebar.menu.title;

            if (!groupedData[String(menuTitle)]) {
                groupedData[String(menuTitle)] = {
                    title: sidebar.menu.title,
                    icon: sidebar.menu.icon,
                    data: []
                };
            }

            sidebar.elementid = generateElementId(sidebar.menu.title);

            if (sidebar.child && sidebar.child.length > 0) {
                sidebar.child.forEach((child: ISidebar) => {
                    if (child.menu.title !== menuTitle) {
                        if (!groupedData[String(child.menu.title)]) {
                            groupedData[String(child.menu.title)] = {
                                title: sidebar.menu.title,
                                icon: child.menu.icon,
                                data: []
                            };
                        }
                        groupedData[String(child.menu.title)].data?.push(child);
                    }
                    if (child.classes.includes('active') && !sidebar.classes.includes('active')) {
                        sidebar.classes = [sidebar.classes, 'active'].join(' ');
                    }
                    child.elementid = generateElementId(child.menu.title);
                });
            } else {
                sidebar.child = [];
            }

            groupedData[String(menuTitle)].data?.push(sidebar);
            if (!groupedData[String(menuTitle)].classes) {
                groupedData[String(menuTitle)].classes = sidebar.classes.includes('active') && 'show';
            }
        }

        data.forEach(processSidebar);

        return groupedData;
    }

    public getMenu(name?: string, classes?: string): Array<ISidebarMenuItem> {
        if (!name) {
            name = '';
        }

        const menus: MenuItems | {} = this.menus || {};
        const menuItems = Object.keys(menus).map(item => {
            const menu = String(item).toUpperCase() as keyof typeof menus;
            const selected: ISidebarMenuItem = menus[menu];

            if (menu == String(name).toUpperCase().trim()) {
                selected.classes = ['active', classes].join(' ');
            }

            return selected;
        });

        return menuItems.filter(e => !e.submenus);
    }

    public get(id: string, classes?: string): {[key: string]: Array<ISidebar>;} | null {
        const data: ISidebar[] | undefined = this.sidebar;

        if (!data) return null;

        if (!id) {
            id = '';
        }

        function updateClasses(sidebar: ISidebar) {
            sidebar.classes = sidebar.classes.replace('active', '');

            if (sidebar.id === id) {
                if (classes && classes.length) {{
                    sidebar.classes = [sidebar.classes, classes].join(' ')
                }}
                if (!sidebar.classes.includes('active')) {
                    sidebar.classes = sidebar.classes + " active";
                }
            }
        
            if (sidebar.child && sidebar.child.length) {
                sidebar.child.forEach(updateClasses);
            }
        }
      
        data.forEach(updateClasses);

        return this.groupDataByMenuId(data);
    }
}