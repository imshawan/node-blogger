define('client/consent', ['modules/http'], function (http) {
    const consent = {};

    consent.initialize = function () {
        const {token, user} = Application;

        $('#skip-consent').on('click', function () {
            location.href = '/';
        });

        $('#consent-form').on('submit', function (e) {
            e.preventDefault();
            const formData = {token};

            $.each($(this).find('input:checked'), function(ind, elem) {
                formData[$(elem).attr('name')] = true;
            });

            http.POST(`/user/${user.userid}/consent`, formData)
                .then(res => {
                    location.href = '/';
                })
                .catch(err => {
                    const {message} = err;
                    core.alertError(message);
                });
        });
    }

    return consent;
});