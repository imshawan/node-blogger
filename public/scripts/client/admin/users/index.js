define('client/admin/users/index', ['modules/http'], function (http) {
    const users = {};

    users.initialize = function () {
        $('#select-all-users').off('click').on('click', function () {
            let checked = false;
            if ($(this).prop('checked')) {
                checked = true;
            }
            $.each($('#users-tbody [type="checkbox"]'), function (i, elem) {
                $(elem).prop('checked', checked)
            });
        })
    }

    return users;
})