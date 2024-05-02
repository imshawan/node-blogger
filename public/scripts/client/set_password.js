define('client/set_password', ['modules/http', 'client/utils'], function (http, utils) {
    const setPassword = {};

    setPassword.initialize = function () {
        $('#set-password-form').on('submit', function (e) {
            e.preventDefault();
            const submitBtn = $('#reset-password');
            const form = $(this)

            const formdata = form.serializeObject();
            const urlParts = String(window.location.pathname).split('/');
            const token = urlParts[urlParts.length - 1];
            
            if (!utils.validatePassword(formdata)) {
                return;
            }

            submitBtn.lockWithLoader();

            http.PUT('/user/password/reset', $.extend(formdata, {token}))
                .then(res => {
                    let {message} = res;
                    form.trigger('reset');
                    utilities.showToast(message, 'success');

                    setTimeout(() => {location.href = '/signin'}, 1000);
                })
                .catch(err => {
                    utilities.showToast(err.message, 'error');
                }).finally(() => {
                    submitBtn.unlockWithLoader();
                });
            
        });

        $('#new-password').on('keyup', $.debounce(500, function () {
            const password = $(this).val();
            http.POST('/user/validate/password', {password})
                .then(res => {
                    const {suggestions} = res;
                    $('#password-status').hide();

                    if (suggestions && suggestions.length) {
                        let html = `Suggestions: `;
                        html += suggestions.join('<br />');
                        $('#password-strength-text').html(html).show();
                    }
                })
                .catch(err => {
                    $('#password-status').text(err.message)
                        .css({color: 'red'}).show();
                });
        }));
    }

    return setPassword;
});