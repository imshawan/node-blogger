define('client/admin/settings/users/index', ['modules/http'], function (http) {
    const users = {};

    users.initialize = function () {
        $('#account-settings').dirrty();
        $('#security-settings').dirrty();
        $('#registration-settings').dirrty();

        $('#save').on('click', function () {
            const accountSettings = {};
            const registration = $('#registration-settings').serializeObject();
            const security = $('#security-settings').serializeObject();

            $.each($('#account-settings input[type="checkbox"]'), function (i, e) {
                accountSettings[e.name] = $(e).is(':checked');
            });

        });

    }

    return users;
});