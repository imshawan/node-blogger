define('client/set_password', ['modules/http'], function (http) {
    const setPassword = {};
    const MIN_PASSWORD_LENGTH = 6;

    setPassword.initialize = function () {
        $('#set-password-form').on('submit', function (e) {
            e.preventDefault();
            const submitBtn = $('#reset-password');
            const form = $(this)

            const formdata = form.serializeObject();
            const urlParts = String(window.location.pathname).split('/');
            const token = urlParts[urlParts.length - 1];
            
            if (!setPassword.validatePassword(formdata)) {
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

    setPassword.validatePassword = function (formData={}) {
        const passwordStatus = $('#password-status');
        const passwordConfirmStatus = $('#confirm-status');

        const doNotMatch = 'Paswords do not match';
        const lengthIssue = `Passwords must be atleast ${MIN_PASSWORD_LENGTH} characters long`;

        const {password, confirmPassword} = formData;
        let errors = 0;

        if (password != confirmPassword) {
            passwordStatus.empty().text(doNotMatch).show();
            passwordConfirmStatus.empty().text(doNotMatch).show();
            errors++;
        } 

        if (password.length < MIN_PASSWORD_LENGTH) {
            passwordStatus.empty().text(lengthIssue).show();
            errors++;
        } 
        
        if (confirmPassword.length < MIN_PASSWORD_LENGTH) {
            passwordConfirmStatus.empty().text(lengthIssue).show();
            errors++;

        } 
        
        if (!errors) {
            passwordStatus.hide();
            passwordConfirmStatus.hide();

            return true;
        }

        return false;
    }

    return setPassword;
});