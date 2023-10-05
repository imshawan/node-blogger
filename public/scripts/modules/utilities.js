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

    utilities.getQueryParamsFromUrl = function (url) {
        if (!url) {
            url = location.href || window.location.href;
        }
        
        let splittedUrl = url.split('?');
        if (splittedUrl.length <= 1) {
            return {}
        }

        let urlparams = new URLSearchParams(splittedUrl[1]);
        let queryParamsObject = {};

        for(var value of urlparams.keys()) {
            queryParamsObject[value] = urlparams.get(value);
        }

        return queryParamsObject;
    }

    utilities.objectToQueryString = function (obj) {
        if (!Object.keys(obj).length) return '';
        
        return Object.keys(obj).map(key => {
            if (obj[key] !== undefined && obj[key] !== null) {
                return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
            }
            return '';
        }).filter(param => param !== '').join('&');
    }

    return utilities;
}));