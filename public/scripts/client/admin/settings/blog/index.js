define('client/admin/settings/blog/index', ['modules/http'], function (http) {
    const blog = {};

    blog.initialize = function () {

        $('#blog-settings').dirrty();

        $('#save').on('click', function () {
            const target = $(this);
            const data = {
                sorting: $('[name="sorting"]').val()
            };

            $.each($('#blog-settings input[type="checkbox"]'), function (i, e) {
                data[e.name] = $(e).is(':checked');
            });

            http.PUT('/api/v1/admin/application/common', JSON.stringify(data), {contentType: 'application/json'})
                .then(res => {
                    $('#blog-settings').dirrty('setClean');

                    if (Object.keys(res).length) {
                        Object.assign(Application._config || {}, res);
                    }

                    utilities.showToast('Data was saved successfully.', 'success');
                })
                .catch(err => utilities.showToast(err.message, 'error'))
                .finally(() => target.unlockWithLoader());
        });
    }

    return blog;
});