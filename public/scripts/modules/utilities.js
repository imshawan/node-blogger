'use strict';

(function (factory) {
    if (typeof module === 'object' && module.exports) {
        console.log('yes')
        module.exports = factory(console);
    } else {
        window.utilities = factory(console);
    }
}(function (console) {
    const utilities = {};

    utilities.generateUUID = function generateUUID() {
        const timestamp = new Date().getTime();

        var uuid = 'xxxxxxxx-6xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        return timestamp.toString(16) + '-' + uuid;
    };

    return utilities;
}));