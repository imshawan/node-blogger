'use strict';

(function (factory) {
    window.admin = factory();
}(function () {
    const admin = {};

    admin.bootstrap = function bootstrap () {
        admin.attachEvents();
    }

    admin.attachEvents = function attachEvents() {
        // Custom redirection for sidebar
        $('[data-href]').on('click', function() {
            const {href} = $(this).data();
            location.href = href;
        });
    }

    $(document).ready(function () {
        admin.bootstrap();
     });

    return admin;
}));