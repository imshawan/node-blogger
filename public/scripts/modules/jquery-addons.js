(function ($) {
    $.fn.lockWithLoader = function() {
        let element = $(this[0]);
        let currentText = element.text();

        element.attr('data-text', currentText)
            .empty().append('<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>');
        element.attr('disabled', true);
    }

    $.fn.unlockWithLoader = function() {
        let element = $(this[0]);
        let text = element.data('text');
        element.empty().text(text).attr('disabled', false);
    }
}(jQuery || { fn: {} }));