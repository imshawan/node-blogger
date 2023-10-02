define('client/admin/categories/list', [], function () {
    const list = {};

    list.initialize = function () {
        $('.list-group-item').on('click', function () {
            console.log($(this).data('has-child'))
            if (!$(this).data('has-child')) return;

            $('.fa', this)
              .toggleClass('fa-chevron-right')
              .toggleClass('fa-chevron-down');
        });

        $('#category-search-form').on('submit', function (e) {
            e.preventDefault();
            const formData = $(this).serializeObject();
            console.log(formData)
        });

        $.each($('canvas[data-category-name]'), function (i, elem) {
            const id = $(elem).attr('id');
            const name = $(elem).data('category-name');
            core.generateAvatarFromName(id, name)
        });
    }

    return list;
})