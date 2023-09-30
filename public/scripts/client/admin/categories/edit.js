define('client/admin/categories/edit', ['modules/http', 'client/admin/categories/events'], function (http, events) {
    const edit = {};

    edit.initialize = function () {
        const {category} = Application;
        
        events.initialize();
        edit.attachEvents(category);
        
    }
    
    edit.attachEvents = function (category) {
        const message = `This action will permanently remove all its associated content, posts, subcategories, and tags from the platform.`;
        const select2Options = {
            placeholder: "Create tags",
            width: '100%',
            tags: true,
            createTag: function (params) {
                var term = $.trim(params.term);
            
                if (term === '') {
                  return null;
                }
            
                return {
                  id: utilities.generateUUID(),
                  text: term,
                }
              }
        };

        $("#tagsInput").select2(select2Options);

        $("#tagsInput").on('select2:unselect', function (e) {
            var deselectedOption = e.params.data;
        });

        $('#delete-category').on('click', function () {
            var dialog = bootbox.dialog({
                title: `Are you sure to delete category <span class="font-italic">"${category.name}"</span>`,
                message: `
                    <p>${message}</p>
                    <p>${edit.getDeletionPointers(category)}</p>
                    <p><span class="text-danger font-weight-semibold">Warning!</span> This process cannot be undone. Please ensure that you have carefully reviewed the consequences before proceeding with this action.</p>
                    `,
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
                            edit.deleteCategory(category.cid);
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
            alertSuccess('Category information updated!');

        }).catch(err => {
            alertError(err.message);
        });
    }

    edit.deleteCategory = function (id) {
        http.DELETE('/api/v1/admin/categories/' + id).then(res => {
            const callback = () => location.href = [location.origin, 'admin', 'categories'].join('/');

            alertSuccess('Category deleted!', callback);

        }).catch(err => {
            alertError(err.message);
        });
    }

    edit.updateTag = function (categoryId, tagId) {
        http.PUT(`/api/v1/admin/categories/${categoryId}/tags/${tagId}`).then(res => {}).catch(err => {
            alertError(err.message);
        });
    }

    edit.deleteTag = function (categoryId, tagId) {
        http.DELETE(`/api/v1/admin/categories/${categoryId}/tags/${tagId}`).then(res => {}).catch(err => {
            alertError(err.message);
        });
    }

    edit.getDeletionPointers = function (category) {
        let {name} = category;
        name = `<span class="font-monospace font-weight-semibold">${name}</span>`;
        return `
            <ul>
                <li>All content, including posts, sub-categories and media, within ${name} will be deleted and cannot be recovered. This would impact the discoverability of content.</li>
                <li>Users who have engaged with the category will lose access to their contributions, and ongoing discussions will be terminated.</li>
            </ul>
        `
    }

    return edit;
});