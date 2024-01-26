define('client/admin/categories/edit', [
    'modules/http', 
    'client/admin/categories/events', 
    'client/admin/categories/utils'
], function (http, events, utils) {
    const edit = {};

    edit.initialize = function () {
        const {category, tags} = Application;
        
        events.initialize();
        edit.attachEvents(category, tags);
        
    }
    
    edit.attachEvents = function (category, tags) {
        const parentCategorySelector = $("#parent-cid-selection");
        const select2Options = {
            placeholder: 'Select...',
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
        };

        if (category.parent && Object.keys(category.parent).length) {
            select2Options.data = [category.parent].map(el => ({...el, id: el.cid, text: el.name}));
        }

        $("#tagsInput").select2({
            placeholder: "Create tags",
            width: '100%',
            tags: true,
            data: tags
        });

        parentCategorySelector.select2(select2Options);

        $("#tagsInput").on('select2:unselect', function (e) {
            let deselectedOption = e.params.data;
            let data = $(deselectedOption.element).data();
            let id = data.tagId || deselectedOption.id;

            edit.deleteTag(category.cid, id);
        });

        $("#tagsInput").on('select2:select', function (e) {
            let selectedOption = e.params.data;
            let {text} = selectedOption;

            edit.createTag(category.cid, {name: text}).then((res) => {
                if (res && res._id) {
                    $("#tagsInput option").val(text).attr('data-tag-id', res.tagId);
                }
            }).catch(e => core.alertError(e.message))
        });

        $('#delete-category').on('click', function () {
            var dialog = bootbox.dialog({
                title: `Are you sure to delete category <span class="font-italic">"${category.name}"</span>`,
                message: utils.getDeletionMessage(category),
                buttons: {
                    cancel: {
                        label: "Cancel",
                        className: 'btn-danger',
                        callback: function(){
                            dialog.hide('modal');
                        }
                    },
                    ok: {
                        label: "Ok",
                        className: 'btn-info',
                        callback: function(){
                            utils.deleteCategory(category.cid);
                        }
                    }
                },
            });
        });

        $('#category-form').on('submit', function (e) {
            e.preventDefault();

            const formData = new FormData($(this)[0])
            const categoryImage = $('#category-image')[0].files;
            const altThumb = $('[name="altThumb"]').val();

            formData.append('altThumb', altThumb);

            if (categoryImage && categoryImage.length) {
                if (categoryImage[0].type.split('/')[0] == 'image') {
                    formData.append('thumb', categoryImage[0]);
                }
            }

            edit.updateCategory(category.cid, formData);

        });
    }

    edit.updateCategory = function (id, formData) {
        http.PUT('/api/v1/admin/categories/' + id, formData, {
            cache: false,
            contentType: false,
            processData: false,
        }).then(res => {
            core.alertSuccess('Category information updated!');

        }).catch(err => {
            core.alertError(err.message);
        });
    }

    edit.createTag = function (categoryId, formData) {
        return new Promise((resolve, reject) => {
            http.POST(`/api/v1/admin/categories/${categoryId}/tags`, formData).then(res => resolve(res)).catch(err => {
                reject(err.message);
            });
        });
    }

    edit.deleteTag = function (categoryId, tagId) {
        http.DELETE(`/api/v1/admin/categories/${categoryId}/tags/${tagId}`).then(res => {}).catch(err => {
            core.alertError(err.message);
        });
    }

    return edit;
});