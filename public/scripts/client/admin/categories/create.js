define('client/admin/categories/create', [
    'modules/http', 
    'client/admin/categories/events',
    'client/admin/categories/utils'
], function (http, events, utils) {
    const create = {};

    create.initialize = function () {
        const {category} = Application;
        // core.generateAvatarFromName('category-icon');

        events.initialize();
        const data = create.checkLocalStore();
        const form = $('#category-form');
        const select2Options = {
            placeholder: 'Select parent category (optional)',
            width: '100%',
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
        }
        
        if (data && Object.keys(data).length) {
            form.find('[name="name"]').val(data.name);
            if (data.category && !Array.isArray(data.category)) {
                select2Options.data = [data.category];
            }
        }

        $('#parent-cid-selection').select2(select2Options);

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
                        callback = () => location.href = [location.origin, 'admin', 'manage', 'categories', res.slug].join('/');
                    }
                    dialog.hide();
                    core.alertSuccess('Category created!', callback);
                    
                }).catch(err => {
                    dialog.hide();
                    core.alertError(err.message);
                });
        });
    }

    create.checkLocalStore = function () {
        const url = new URLSearchParams(window.location.search);
        const state = url.get('state');

        if (state && state == 'editing') {
            let cached = window.localStorage.getItem('category-create');
            if (!cached) {
                return {};
            }
            
            return JSON.parse(cached); 
        }
    }

    return create;
})