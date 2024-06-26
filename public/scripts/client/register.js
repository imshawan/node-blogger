define('client/register', ['modules/http'], function (http) {
    const register = {};
    const MIN_PASSWORD_LENGTH = 6;

    var isUsernameValid = false;
    var isPasswordValid = false;

    register.initialize = function () {

        $('#registeration-form').on('submit', function (e) {
            e.preventDefault();

            const form = $(this);
            const csrfToken = String($('form#csrf_token > input').val());
            let errors = 0;
    
            if (!register.validatePassword(form)) {
                errors++;
            }
            if (!isUsernameValid) {
                errors++;
            }
            if (!isPasswordValid) {
                errors++;
            }
            if (errors) return;

            const formdata = form.serializeObject();
            $.ajax({
                url: '/register',
                method: 'post',
                data: formdata,
                headers: {
                    'csrf-token': csrfToken
                }
            }).then(res => {
                    const {payload} = res;
                    location.href = payload.next;
                })
                .catch(err => {
                    let errMessage;
					if (err.responseJSON) {
						errMessage = err.responseJSON.status && err.responseJSON.status.message ?
							err.responseJSON.status.message :
							err.responseJSON.error;
					}

                    $('#errors-area > span').text(errMessage);
                    $('#errors-area').show();

                    core.scrollToTop();
                });

        });

        $('#usernameInput').on('keyup', $.debounce(500, function () {
            const username = $(this).val();
            http.GET('/user/validate/username/' + username , {})
                .then(res => {
                    isUsernameValid = true;
                    $('#username-status-text').text(`Cool! People can now mention you with @${username}`)
                        .css({color: 'rgb(98, 98, 98)'}).show();
                })
                .catch(err => {
                    $('#username-status-text').text(err.message)
                        .css({color: 'red'}).show();
                });
        }));

        $('#password-input').on('keyup', $.debounce(500, function () {
            const password = $(this).val();
            http.POST('/user/validate/password', {password})
                .then(res => {
                    const {suggestions} = res;
                    isPasswordValid = true;
                    $('#password-status-text').hide();

                    if (suggestions && suggestions.length) {
                        let html = `Suggestions: `;
                        html += suggestions.join('<br />');
                        $('#password-strength-text').html(html).show();
                    }
                })
                .catch(err => {
                    $('#password-status-text').text(err.message)
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