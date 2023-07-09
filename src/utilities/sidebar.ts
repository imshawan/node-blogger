import _ from "lodash";
import { ISidebar } from "@src/types";

export class SideBar {
    sidebar: Array<ISidebar>;
    constructor(sidebarData: Array<ISidebar>) {
        this.sidebar = sidebarData;

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
        const data: Array<ISidebar> = this.sidebar;
      
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
        const groupedData: { [key: string]: ISidebar[] } = {};
        const generateElementId = this.generateElementId;

        function processSidebar(sidebar: ISidebar) {
            const menuTitle = sidebar.menu.title;

            if (!groupedData[menuTitle]) {
                groupedData[menuTitle] = [];
            }

            sidebar.elementid = generateElementId(sidebar.menu.title);

            if (sidebar.child && sidebar.child.length > 0) {
                sidebar.child.forEach((child) => {
                    if (child.menu.title !== menuTitle) {
                        if (!groupedData[child.menu.title]) {
                            groupedData[child.menu.title] = [];
                        }
                        groupedData[child.menu.title].push(child);
                    }
                    if (child.classes.includes('active') && !sidebar.classes.includes('active')) {
                        sidebar.classes = [sidebar.classes, 'active'].join(' ');
                    }
                    child.elementid = generateElementId(child.menu.title);
                });
            } else {
                sidebar.child = [];
            }

            groupedData[menuTitle].push(sidebar);
        }

        data.forEach(processSidebar);

        return groupedData;
    }

    public get(id: string, classes?: string): {[key: string]: Array<ISidebar>;} {
        const data = this.sidebar;

        if (!id) {
            throw new Error('A valid id is required');
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