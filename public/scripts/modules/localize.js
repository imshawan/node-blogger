/*
 * Copyright (C) 2024 Shawan Mandal <github@imshawan.dev>.
 *
 * Licensed under the GNU General Public License v3, 29 June 2007
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

'use strict';

(function (factory) {
    window.Localization = factory();
}(function () {

    /**
     * @date 19-05-2024
     * @author imshawan <github@imshawan.dev>
     * 
     * @class Localization
     * @description This file defines a Localization class to manage internationalization and localization in a web application using i18next. 
     * It provides functionality to initialize i18next with specific language and namespaces, load namespaces dynamically if they are not already loaded, 
     * and translate keys from loaded namespaces.
     */

    class Localization {
        /**
         * @param {string} lang - The language to initialize i18next with.
         * @param {Array<string>} namespaces - The namespaces to initialize i18next with.
         * @param {boolean} [debug=false] - Flag to enable or disable debug mode.
         */
        constructor(lang, namespaces, debug=false) {
            /** 
             * @type {string} 
             * @description The current language used for translations.
             */
            this.lang = lang;

            /** 
             * @type {boolean} 
             * @description Flag to enable or disable debug mode for i18next.
             * @default false 
             */
            this.debug = debug;

            /** 
             * @type {Array<string>} 
             * @description The namespaces used for translations.
             * @default ['common'] 
             */
            this.namespaces = namespaces ?? ['common'];

            /** 
             * @type {string} 
             * @description The fallback language if the current language translations are not available.
             * @default 'en' 
             */
            this.fallbackLng = 'en';

            /** 
             * @type {boolean} 
             * @description Flag to enable or disable caching of translation resources.
             * @default true 
             */
            this.cacheEnabled = true;

            /** 
             * @type {number} 
             * @description The expiration time for the cache in milliseconds.
             * @default 7 * 24 * 60 * 60 * 1000 (1 week) 
             */
            this.cacheExpirationTime = 7 * 24 * 60 * 60 * 1000;

            /** 
             * @type {boolean} 
             * @description Flag to check if i18next has been initialized.
             * @default false 
             */
            this.isInitialized = false;
        }
    
        initialize() {
            if (this.isInitialized) {
                return Promise.resolve();
            }
            if (typeof i18next === 'undefined') {
                return Promise.reject('i18next module is not found or maybe invalid, please validate before initialization');
            }
            if (typeof i18nextHttpBackend === 'undefined') {
                return Promise.reject('i18nextHttpBackend module is not found or maybe invalid, please validate before initialization');
            }
            if (!this.lang) {
                return Promise.reject('No language provided');
            }
            if (!this.namespaces || !this.namespaces.length) {
                return Promise.reject('No namespaces provided');
            }
            if (!Array.isArray(this.namespaces)) {
                return Promise.reject('Namespaces must be an array');
            }

            return new Promise((resolve, reject) => {
                i18next
                    .use(i18nextHttpBackend)
                    .init({
                        lng: this.lang,
                        debug: this.debug,
                        fallbackLng: this.fallbackLng,
                        ns: this.namespaces,
                        defaultNS: this.namespaces[0],
                        backend: {
                            loadPath: '/locales/{{lng}}/{{ns}}.json',
                        },
                        cache: {
                            enabled: this.cacheEnabled,
                            expirationTime: this.cacheExpirationTime,
                        },
                    }, (err, t) => {
                        if (err) {
                            reject(err);
                        } else {
                            this.isInitialized = true;
                            resolve(t);
                        }
                    });
            });
        }

        isNamespaceLoaded(namespace) {
            if (!namespace) {
                return false;
            }

            return i18next.hasResourceBundle(this.lang, namespace);
        }
    
        loadNamespace(namespace) {
            if (!namespace) {
                return false;
            }

            return new Promise((resolve, reject) => {
                $.ajax({
                    url: `/locales/${this.lang}/${namespace}.json`,
                    dataType: 'json',
                    success: (data) => {
                        // Add the namespace to i18next
                        i18next.addResourceBundle(this.lang, namespace, data);
                        resolve();
                    },
                    error: (jqXHR, textStatus, errorThrown) => {
                        reject(`Error loading namespace: ${textStatus} - ${errorThrown}`);
                    }
                });
            });
        }
    
        async translate(key) {
            let [namespace, text] = key.split(':');
            if (!namespace || !text) {
                return key;
            }

            if (!this.isNamespaceLoaded(namespace)) {
                try {
                    await this.loadNamespace(namespace);
                } catch (err) {
                    console.error('Error occured:', err.message);
                    return '';
                }
            }

            if (i18next.exists(key)) {
                return i18next.t(key);
            } else {
                return text;
            }
        }
    }
    
    return Localization;
}));