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
    utilities.toastPlacement = {
        "top-left": "top-0 start-0",
        "top-center": "top-0 start-50 translate-middle-x",
        "top-right": "top-0 end-0",
        "middle-left": "top-50 start-0 translate-middle-y",
        "middle-center": "top-50 start-50 translate-middle",
        "middle-right": "top-50 end-0 translate-middle-y",
        "bottom-left": "bottom-0 start-0",
        "bottom-center": "bottom-0 start-50 translate-middle-x",
        "bottom-right": "bottom-0 end-0"
    };
    utilities.toastTypes = {
        "info": "text-bg-secondary",
        "error": "text-bg-danger",
        "success": "text-bg-success",
        "warning": "text-bg-warning",
        "important":  "text-bg-primary",
    }

    utilities.generateUUID = function generateUUID() {
        const timestamp = new Date().getTime();

        var uuid = 'xxxxxxxx-6xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        return timestamp.toString(16) + '-' + uuid;
    };

    utilities.isValidEmail = function (email) {
        const isValid = String(email)
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
    
        return Boolean(isValid && isValid.length);
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

    utilities.renderImageFromFile = function (file, target) {
        target = $('body').find(target);
        if (!target.length) return;
        
        let reader = new FileReader();
        reader.onload = function () {
            target.attr('src', this.result);
        };
        reader.readAsDataURL(file);
    }

    utilities.showToast = function (message, type, placement) {
        const container = '#toast-container';
        let id = utilities.generateUUID();
        let bodyClass = '';

        if (!placement) {
            placement = utilities.toastPlacement['top-right'];
        }
        if (!$('body').find(container).length) {
           $('body').append($('<div>', {id: 'toast-container', class: 'toast-container position-fixed p-3 ' + placement}));
        }
        if (!type) {
            type = 'Info';
        }
        bodyClass = utilities.toastTypes[type] || utilities.toastTypes['info'];

        $(container).append(`
            <div id="${id}" class="toast ${bodyClass} align-items-center border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex" style="padding: var(--bs-toast-padding-y) var(--bs-toast-padding-x);">
                    <strong class="me-auto">${type.toUpperCase()}</strong>
                    <button type="button" class="btn-close btn-close-white me-0 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>    
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `);
        new bootstrap.Toast($(`#${id}`)[0]).show();
    }

    utilities.copyToClipboard = async function(text) {
        try {
            await navigator.clipboard.writeText(text);
            utilities.showToast('Copied to clipboard', 'success');
        } catch (err) {
            utilities.showToast('Failed to copy to clipboard', 'error');
        }
    }

    return utilities;
}));