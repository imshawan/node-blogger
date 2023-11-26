define('client/admin/settings/posts/index', ['modules/http'], function (http) {
    const posts = {};

    posts.initialize = function () {

        $('#posts-general-settings').dirrty();

        $('#save').on('click', function () {
            const data = $('#posts-general-settings').serializeObject();
            Object.keys(data).forEach(field => {
                if (!isNaN(String(data[field]))) {
                    data[field] = Number(data[field]);
                }
            });
            
            http.PUT('/api/v1/admin/application/common', JSON.stringify(data), {contentType: 'application/json'})
                .then(res => {
                    $('#posts-general-settings').dirrty('setClean');

                    if (Object.keys(res).length) {
                        Object.assign(Application._config || {}, res);
                    }

                    utilities.showToast('Data was saved successfully.', 'success');
                })
                .catch(err => utilities.showToast(err.message, 'error'));
        });
    }

    return posts;
});