(function ($) {
    $.fn.lockWithLoader = function(text='') {
        let element = $(this[0]);
        let currentText = element.text();

        element.attr('data-text', currentText)
            .empty().append(`<span>${text}&nbsp;</span><i class="fa fa-spinner fa-spin" aria-hidden="true"></i>`);
        element.attr('disabled', true);
    }

    $.fn.unlockWithLoader = function(text='') {
        let element = $(this[0]);
        let textMsg = text || element.data('text');
        element.empty().html(textMsg).attr('disabled', false);
    }
}(jQuery || { fn: {} }));