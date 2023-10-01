$(document).ready(function () {
    const {modules, pageScript} = Application;
    loadScripts(modules);
    loadScripts(pageScript);
    attachGlobalEvents();
    initialize();
    attachServiceWorker();
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

  /**
   * @date 22-03-2023
   * @author imshawan <hello@imshawan.dev>
   * @function scrollToTop
   * @description Scrolls back to document's (DOM) begining position
   */
  function scrollToTop () {
    try {
        // For Chrome, Firefox, IE, Opera, etc.
        document.documentElement.scrollTop = 0; 
    } catch (e) {
        try {
            // For Mac (safari) support
            document.body.scrollTop = 0;
        } catch (er) {}
    }
  }

  function attachGlobalEvents() {
    // Override signout form event so that csrf tokens can be added to the headers
    $('body').on('submit', '#signout-form', function(e) {
        e.preventDefault();

        const csrfToken = String($('form#csrf_token > input').val());
        console.log(csrfToken);

        $.ajax({
            url: '/signout',
            method: 'post',
            data: {},
            headers: {
                'csrf-token': csrfToken
            }
        }).then(res => {
                location.href = '/';
            })
            .catch(err => {
                let errMessage;
                if (err.responseJSON) {
                    errMessage = err.responseJSON.status && err.responseJSON.status.message ?
                        err.responseJSON.status.message :
                        err.responseJSON.error;
                }
                console.log(errMessage);
            });
    });
  }

function generateAvatarFromName(canvasId, name='Unknown name') {
    const colours = [
      "#1abc9c",
      "#2ecc71",
      "#3498db",
      "#9b59b6",
      "#34495e",
      "#16a085",
      "#27ae60",
      "#2980b9",
      "#8e44ad",
      "#2c3e50",
      "#f1c40f",
      "#e67e22",
      "#e74c3c",
      "#95a5a6",
      "#f39c12",
      "#d35400",
      "#c0392b",
      "#bdc3c7",
      "#7f8c8d",
    ];

    const nameSplit = name.split(" "),
        initials = nameSplit[0].charAt(0).toUpperCase() + nameSplit[1].charAt(0).toUpperCase();
    
    const charIndex = initials.charCodeAt(0) - 65,
        colourIndex = charIndex % 19;
    
    const canvas = document.getElementById(canvasId);
    const context = canvas.getContext("2d");
    
    const canvasWidth = $(canvas).attr("width") || 128,
        canvasHeight = $(canvas).attr("height") || 128,
        canvasCssWidth = canvasWidth,
        canvasCssHeight = canvasHeight,
        fontSize = canvasCssWidth / 2;
    
    if (window.devicePixelRatio) {
        $(canvas).attr("width", canvasWidth * window.devicePixelRatio);
        $(canvas).attr("height", canvasHeight * window.devicePixelRatio);
        $(canvas).css("width", canvasCssWidth);
        $(canvas).css("height", canvasCssHeight);
        context.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    
    context.fillStyle = colours[colourIndex];
    context.fillRect (0, 0, canvas.width, canvas.height);
    context.font = fontSize + "px sans-serif";
    context.textAlign = "center";
    context.fillStyle = "#FFF";
    context.fillText(initials, canvasCssWidth / 2, canvasCssHeight / 1.5);
}

function alertSuccess(message, callback) {
    const options = {
        message,
        closeButton: false,
        backdrop: false,
    };

    if (callback) {
        if (typeof callback == 'function') {
            options.callback = callback;
        }
    }

    const alertModal = bootbox.alert(options);

    alertModal.find('.modal-content').addClass('border-success');
}

function alertError(message, callback) {
    const options = {
        message,
        closeButton: false,
        backdrop: false,
    };

    if (callback) {
        if (typeof callback == 'function') {
            options.callback = callback
        }
    }

    const alertModal = bootbox.alert(options);

    alertModal.find('.modal-content').addClass('border-danger');
}

function initialize() {
    
}

function attachServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        return console.warn('Aborting serviceWorker registeration (Not found)');
    }

    navigator.serviceWorker.register('/scripts/worker.js')
        .then(() => {
            console.info('ServiceWorker registration successfull!');
        })
        .catch(err => {
            console.error('ServiceWorker registration failed!', err);
        });

    // navigator.serviceWorker.getRegistrations().then(function(registrations) {
    //     if (registrations && registrations.length) {
    //         // return console.warn('Aborting serviceWorker registeration (Already installed)');
    //     } else {
            
    //     }
    // });
}

function imageOnError(element) {
    const defaultOnErrorImage = '/img/default-image.jpeg';
    element = $(element);
    if (element.data('onerror') && element.data('onerror').length) {
        element.attr('src', element.data('onerror'));
    } else {
        element.attr('src', defaultOnErrorImage);
    }

    element.attr('onerror', null);
}