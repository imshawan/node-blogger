$(document).ready(function () {
    const {modules, pageScript} = pagePayload;
    loadScripts(modules)
    loadScripts(pageScript)
});

function loadScripts (scripts, callback) {
    if (!Array.isArray(scripts)) {
        if (typeof scripts === 'string') {
            scripts = [scripts];
        }
    }

    let outstanding = scripts.length;

    scripts.map(function (script) {
        if (typeof script === 'function') {
            return function (next) {
                script();
                next();
            };
        }
        if (typeof script === 'string') {
            return function (next) {    
                console.log(script);
                require([script], function (script) {
                    if (script && script.initialize) {
                        script.initialize();
                    }
                    next();
                }, function () {
                    // ignore 404 error
                    next();
                });
            };
        }
        return null;
    }).filter(Boolean).forEach(function (fn) {
        fn(function () {
            outstanding -= 1;
            if (outstanding === 0) {
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        });
    });
};