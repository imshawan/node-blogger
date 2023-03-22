define('client/register', ['modules/http'], function (http) {
    const register = {};
    const MIN_PASSWORD_LENGTH = 6;

    var isUsernameValid = false;

    register.initialize = function () {

        $('#registeration-form').on('submit', function (e) {
            const form = $(this);

            if (form.attr('verified') == 'false') {
                e.preventDefault();
                if (register.validatePassword(form)) {
                    if (isUsernameValid) {
                        form.attr('verified', true);
                        form.trigger('submit');
                    }
                }
            }
        });

        $('#usernameInput').on('keyup', $.debounce(400, function () {
            const username = $(this).val();
            http.GET('/user/validate/username/' + username , {})
                .then(res => {
                    isUsernameValid = true;
                    $('#username-status-text').text(`Cool! People can now mention you with @${username}`).show();
                })
                .catch(err => {
                    $('#username-status-text').text(err.message)
                        .css({color: 'red'}).show();
                });
        }));
    }

    register.validatePassword = function (form) {
        const passwordStatus = $('#password-status-text');
        const passwordConfirmStatus = $('#confirm-password-status-text');

        const doNotMatch = 'Paswords do not match';
        const lengthIssue = `Passwords must be atleast ${MIN_PASSWORD_LENGTH} characters long`;

        const {password, confirmpassword} = $(form).serializeObject();
        let errors = 0;

        if (password != confirmpassword) {
            passwordStatus.empty().text(doNotMatch).show();
            passwordConfirmStatus.empty().text(doNotMatch).show();
            errors++;
        } 

        if (password.length < MIN_PASSWORD_LENGTH) {
            passwordStatus.empty().text(lengthIssue).show();
            errors++;
        } 
        
        if (confirmpassword.length < MIN_PASSWORD_LENGTH) {
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

    return register;
});