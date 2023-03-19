define('client/register', [], function () {
    const register = {};
    const MIN_PASSWORD_LENGTH = 6;

    register.initialize = function () {

        $('#registeration-form').on('submit', function (e) {
            const form = $(this);

            if (form.attr('verified') == 'false') {
                e.preventDefault();
                if (register.validatePassword(form)) {
                    form.attr('verified', true);
                    form.trigger('submit');
                }
            }
        });
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