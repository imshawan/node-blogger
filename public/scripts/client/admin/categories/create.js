define('client/admin/categories/create', ['modules/http', 'client/admin/categories/events'], function (http, events) {
    const create = {};

    create.initialize = function () {
        const {category} = Application;
        // core.generateAvatarFromName('category-icon');

        events.initialize();

        $('#category-form').off().on('submit', function (e) {
            e.preventDefault();

            const dialog = bootbox.dialog({
                title: 'Category creation in progress...',
                message: '<p><i class="fas fa-spin fa-spinner"></i><span class="ms-2">Loading...</span></p>',
                closeButton: false,
                backdrop:false,
                // centerVertical: true,
            });

            const formData = new FormData($(this)[0])
            const categoryImage = $('#category-image')[0].files;

            if (categoryImage && categoryImage.length) {
                if (categoryImage[0].type.split('/')[0] == 'image') {
                    formData.append('thumb', categoryImage[0]);
                }
            }

            http.POST('/api/v1/admin/categories', formData, {
                cache: false,
                contentType: false,
                processData: false,
            }).then(res => {
                    let callback;

                    if (res && res.slug) {
                        callback = () => location.href = [location.origin, 'admin', 'categories', res.slug].join('/');
                    }
                    dialog.hide();
                    core.alertSuccess('Category created!', callback);
                    
                }).catch(err => {
                    dialog.hide();
                    core.alertError(err.message);
                });
        });
    }

    return create;
})