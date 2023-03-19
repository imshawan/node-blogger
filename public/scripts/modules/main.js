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

(function() {
    'use strict';
    window.addEventListener('load', function() {
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      var forms = document.getElementsByClassName('needs-validation');
      // Loop over them and prevent submission
      var validation = Array.prototype.filter.call(forms, function(form) {
        form.addEventListener('submit', function(event) {
          if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
          }
          form.classList.add('was-validated');
        }, false);
      });
    }, false);
  })();