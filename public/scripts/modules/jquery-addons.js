(function ($) {
    $.fn.lockWithLoader = function(text='') {
        let element = $(this[0]);
        let currentText = element.html();

        element.attr('data-content', currentText)
            .empty().append(`<span>${text}&nbsp;</span><i class="fa fa-spinner fa-spin" aria-hidden="true"></i>`);
        element.attr('disabled', true);
    }

    $.fn.unlockWithLoader = function(text='') {
        let element = $(this[0]);
        let textMsg = text || element.data('content');
        element.empty().html(textMsg).attr('disabled', false);
    }
    
    $.fn.parseCheckboxes = function () {
        const selector = $(this[0]);
        const data = {};

        $.each($(selector).find('input[type="checkbox"]'), function (i, e) {
            data[e.name] = $(e).is(':checked');
        });

        return data;
    }
}(jQuery || { fn: {} }));