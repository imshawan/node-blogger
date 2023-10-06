define('client/admin/categories/list', ['client/admin/categories/utils', 'modules/http'], function (utils, http) {
    const list = {};

    list.initialize = function () {
        const parentCategorySelector = $("#parent-cid-selection");
        const select2Options = {
            placeholder: 'Select...',
            width: '100%',
            dropdownParent: $("#new-category-modal"),
            templateResult: utils.select2TemplateFormatOptions,
            templateSelection: utils.select2TemplateFormatOptions,
            ajax: {
                url: '/api/v1/admin/categories?perPage=5',
                data: function (params) {
                    return {
                        search: params.term,
                    }
                },
                processResults: function (data) {
                    return {
                        results: data.payload.data.map(el => ({
                            ...el,
                            id: el.cid,
                            text: el.name,
                        }))
                    };
                }
            }
        };

        $('.list-group-item').on('click', function () {
            if (!$(this).data('has-child')) return;

            $('.fa', this)
              .toggleClass('fa-chevron-right')
              .toggleClass('fa-chevron-down');
        });

        $('#category-search-form').on('submit', function (e) {
            e.preventDefault();
            let formData = $.extend(utilities.getQueryParamsFromUrl(), $(this).serializeObject());
            let query = utilities.objectToQueryString(formData);

            location.href = '/admin/categories?' + query;
        });

        $.each($('canvas[data-category-name]'), function (i, elem) {
            const id = $(elem).attr('id');
            const name = $(elem).data('category-name');
            core.generateAvatarFromName(id, name);
        });

        $('#new-category-modal').on('shown.bs.modal', function () {
            localStorage.removeItem('category-create');

            $('#new-category-modal-form').trigger('reset');
            parentCategorySelector.select2(select2Options);
        });
          
        $('[redirect-to-create]').on('click', function () {
            const modalForm = $('#new-category-modal-form').serializeObject();
            let selected = parentCategorySelector.select2('data');

            if (selected.length && selected[0].hasOwnProperty('element')) {
                selected = selected[0];
                delete selected.element
            }

            modalForm.category = selected;
            window.localStorage.setItem('category-create', JSON.stringify(modalForm));

            location.href = 'categories/create?state=editing';
        });

        $('#new-category-modal-form').on('submit', function (e) {
            e.preventDefault();

            const button = $('#create-category-btn');
            const formData = $(this).serializeObject();
            const parentCategory = parentCategorySelector.select2('data');
            const modalClose = $('[data-bs-dismiss="modal"]');

            if (parentCategory.length) {
                formData.parent = parentCategory[0].cid;
            }

            const currentText = utilities.lockAndShowLoader(button);

            http.POST('/api/v1/admin/categories', formData).then(res => {
                    let callback;

                    if (res && res.slug) {
                        callback = () => location.href = [location.origin, 'admin', 'categories', res.slug].join('/');
                    }
                    modalClose.trigger('click');
                    core.alertSuccess('Category created!', callback);
                    
                }).catch(err => {
                    modalClose.trigger('click');
                    
                    utilities.unlockElement(button, currentText);
                    core.alertError(err.message);
                });
        });
    }

    return list;
})