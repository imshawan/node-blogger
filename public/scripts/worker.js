/**
 * @author imshawan <hello@imshawan.dev>
 * @date 01-10-2023
 * @description Service Worker Configuration
 * 
 * This file contains the setup for a service worker, including event listeners and cache control logic. 
 * Service workers enable powerful offline capabilities and improved performance for web applications.
 * 
 * By caching assets, we reduce the need for repeated network requests, which can lead to faster page loads 
 * and better user experiences.
*/

const URL_PARAMS = new URLSearchParams(self.location.search);
const DEV_ENV = - URL_PARAMS.get('dev');

const CACHE_NAME = 'node-blogger-assets';
const CACHE_WHITELIST = [
    "/css/main.css",
    "/css/common.css",
    "/css/admin-theme.css",
    "/css/admin.css",
    "https://fonts.googleapis.com/css?family=Lato",
    "/scripts/require.js",
    "/scripts/require.config.js",
    "/scripts/modules/main.js",
    "/scripts/modules/utilities.js",
];
const CACHE_BLACKLIST = [];
const CACHE_BLACKLISTED_CONTENT_TYPES = [];

const LOG = (...args) => DEV_ENV && console.info(...args);

const EVENTS = {};

/**
 * 
 * @function install
 * @param {Event} event 
 * @description Handler for install event. 
 * 
 * This event is triggered when the service worker is first installed. 
 * It is a good place to pre-cache static assets like HTML, CSS, and JavaScript files that are essential for the 
 * application to run offline.
 */
EVENTS.install = async function install (event) {
    event.waitUntil(
        caches
        .open(CACHE_NAME)
        .then((cache) => {
            return cache.addAll(CACHE_WHITELIST);
        })
        .then(() => {
            // Avoid reload time and activate immediately
            self.skipWaiting();
        })
        .catch((err) => {
            console.error('Error occured while opening cache: ');
            throw err;
        })
    )
}

/**
 * 
 * @function activate
 * @param {Event} event 
 * @description Handler for Service Worker activation event. 
 * 
 * After a service worker is installed, it needs to be activated.
 * This event is triggered when the service worker is activated and can be used to clean up any old caches 
 * or perform other maintenance tasks.
 */
EVENTS.activate = async function activate (event) {
    LOG('Service Worker activated successfully!');

    // Returns array containing strings corresponding to all of the named Cache objects tracked by the CacheStorage 
    const cacheNames = await caches.keys();
    const cachesToDelete = cacheNames.filter((item) => item.startsWith(CACHE_NAME));
    
    await Promise.all(cachesToDelete.map((cacheToDelete) => caches.delete(cacheToDelete)));
    await self.clients.claim();
}

/**
 * 
 * @function fetch
 * @param {Event} event 
 * @returns {Response | null | undefined}
 * @description Handler for intercepting Network calls in the Service Worker
 * 
 * This event is triggered whenever a network request is made from within the web page. We can intercept these requests 
 * and decide whether to serve them from the cache (if available) or make a network request.
 */
EVENTS.fetch = async function fetch (event) {
    let flag = 0;

    if (event.request.method !== 'GET') {
        flag++;
    }
    
    CACHE_BLACKLIST.forEach(url => {
        if (event.request.url.includes(url)) {
            flag++;
        }
    });

    if (flag) return LOG('Aborting fetch');

    event.respondWith(
        caches.match(event.request).then(async response => {
            if (response) {
                // If found in cache
                return response;
            }
            return fetch(event.request)
                .then(function (response) {
                    if (response.status === 200) {
                        CACHE_BLACKLISTED_CONTENT_TYPES.forEach(elem => {
                            if (response.headers.get('Content-Type').includes(elem)) {
                                flag++;
                            }
                        });
                        if (flag) {
                            return response;
                        }
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, response.clone());
                            });
                    }

                    return response;
                })
                .catch(function (error) {
                    console.error('Failed to fetch resource');
                    throw error;
                });
        })
    )
}

/**
 * 
 * @function message
 * @param {Event} event 
 * @description Handler to listen to incoming messages
 * 
 * 'message' events are commonly used for scenarios like cross-origin communication, communication between a web page 
 * and its iframes, sending and receiving data in a service worker, or even implementing messaging systems for web applications.
 */
EVENTS.message = async function message (event) {
    LOG('SW message: ', event.data)
}

// Attach all the required dynamically by accessing the keys
Object.keys(EVENTS).forEach(ev => {
    LOG('Attaching SW Events');
    self.addEventListener(ev, EVENTS[ev]);
});