export default {
    DASHBOARD: {title: 'Dashboard', id: 1, submenus: true},
    MANAGE: {title: 'Manage', id: 2, icon: 'bi bi-menu-button-fill', submenus: true},
    SETTINGS: {title: 'Settings', id: 3, icon: 'bi bi-gear', submenus: true},
    ADVANCED: {title: 'Advanced', id: 4, icon: 'bi bi-sliders2-vertical', submenus: true},

    FILES: {title: 'FIle Browser', id: 5, icon: 'bi bi-folder2', url: '/admin/files', submenus: false},
    LOGS: {title: 'Server logs', id: 6, icon: 'bi bi-file-earmark-text', url: '/admin/logs', submenus: false},
    LOGGER: {title: 'Logger', id: 7, icon: 'bi bi-pencil-square', url: '/admin/logger', submenus: false},
    ACTIVITIES: {title: 'Activities', id: 8, icon: 'bi bi-calendar2-event', url: '/admin/activities', submenus: false},
}