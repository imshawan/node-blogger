define('client/admin/settings/categories/index', ['modules/http'], function (http) {
    const categories = {};

    categories.initialize = function () {

        $('#category-general-settings').dirrty();

        $('#save').on('click', function () {
            const data = $('#category-general-settings').serializeObject();
            Object.keys(data).forEach(field => {
                if (!isNaN(String(data[field]))) {
                    data[field] = Number(data[field]);
                }
            });

            http.PUT('/api/v1/admin/application/common', JSON.stringify(data), {contentType: 'application/json'})
                .then(res => {
                    $('#category-general-settings').dirrty('setClean');

                    if (Object.keys(res).length) {
                        Object.assign(Application._config || {}, res);
                    }

                    utilities.showToast('Data was saved successfully.', 'success');
                })
                .catch(err => utilities.showToast(err.message, 'error'));
        });
    }

    return categories;
})