'use strict';

(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(console);
    } else {
        window.utilities = factory(console);
    }
}(function (console) {
    const utilities = {};

    utilities.spinner = '<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>';

    utilities.generateUUID = function generateUUID() {
        const timestamp = new Date().getTime();

        var uuid = 'xxxxxxxx-6xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        return timestamp.toString(16) + '-' + uuid;
    };

    utilities.lockAndShowLoader = function (element) {
        if (typeof element === 'string') {
            element = $(element);
        }

        const currentText = element.text();
        
        element.empty().append(utilities.spinner);
        element.attr('disabled', true);

        return currentText;
    }

    utilities.unlockElement = function (element, defaultText='') {
        if (typeof element === 'string') {
            element = $(element);
        }

        element.empty().append(defaultText);
        element.attr('disabled', false);
    }

    return utilities;
}));