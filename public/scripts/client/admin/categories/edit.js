define('client/admin/categories/edit', ['modules/http'], function (http) {
    const edit = {};

    edit.initialize = function () {
        const {category} = Application;

        const message = `This action will permanently remove all its associated content, posts, subcategories, and tags from the platform.`;

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
                            dialog.hide('modal')
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
        })
    }

    edit.deleteCategory = (id) => {
        http.DELETE('/api/v1/admin/categories/' + id).then(res => {
            const callback = () => location.href = [location.origin, 'admin', 'categories'].join('/');

            alertSuccess('Category deleted!', callback);

        }).catch(err => {
            alertError(err.message);
        });
    }

    edit.getDeletionPointers = (category) => {
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