define('client/admin/settings/users/index', ['modules/http'], function (http) {
    const users = {};

    users.initialize = function () {
        $('#account-settings').dirrty();
        $('#security-settings').dirrty();
        $('#registration-settings').dirrty();

        $('#save').on('click', function () {
            const target = $(this);
            const accountSettings = {};
            const registration = $('#registration-settings').serializeObject();
            const security = $('#security-settings').serializeObject();

            target.lockWithLoader();

            $.each($('#account-settings input[type="checkbox"]'), function (i, e) {
                accountSettings[e.name] = $(e).is(':checked');
            });

            const data = $.extend(accountSettings, registration, security);
            Object.keys(data).forEach(field => {
                if (!isNaN(String(data[field]))) {
                    data[field] = Number(data[field]);
                }
            });
            
            http.PUT('/api/v1/admin/application/common', JSON.stringify(data), {contentType: 'application/json'})
                .then(res => {
                    $('#account-settings').dirrty('setClean');
                    $('#security-settings').dirrty('setClean');
                    $('#registration-settings').dirrty('setClean');

                    if (Object.keys(res).length) {
                        Object.assign(Application._config || {}, res);
                    }

                    utilities.showToast('Data was saved successfully.', 'success');
                })
                .catch(err => utilities.showToast(err.message, 'error'))
                .finally(() => target.unlockWithLoader());
        });

    }

    return users;
});