define('client/utils', [], function () {
    const utils = {};
    const MIN_PASSWORD_LENGTH = 6;

    utils.validatePassword = function (formData={}) {
        let passwordStatus = $('#password-status'),
            passwordConfirmStatus = $('#confirm-status');

        let doNotMatch = 'Paswords do not match',
            lengthIssue = `Passwords must be atleast ${MIN_PASSWORD_LENGTH} characters long`;

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

    return utils;
});