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

        /**
         * @description Hidden input trigger
         */
        $('body').on('click', '[data-file-target]', function () {
            let fileTarget = $(this).data('file-target');
            let fileUploadContainer = $(fileTarget);

            fileUploadContainer.trigger('click');
        });
    }

    $(document).ready(function () {
        admin.bootstrap();
     });

    return admin;
}));