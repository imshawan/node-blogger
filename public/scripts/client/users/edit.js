define('client/users/edit', ['modules/http'], function (http) {
    const edit = {};

    edit.initialize = function () {
        this.attachPageEvents();
        this.profileUpdateEvents();
    }

    edit.attachPageEvents = function () {
        $('#change-profile-image').off('click').on('click', function () {
            $('#profile-image').trigger('click');
        });

        $('#change-cover-image').off('click').on('click', function () {
            $('#cover-image').trigger('click');
        });

        $('#profile-image').on('change', function () {
            let file = this.files[0];
            edit.setImage(file, '#user-profile-image');
            edit.updateUserImage('#profile-image-form');
        });

        $('#cover-image').on('change', function () {
            let file = this.files[0];
            edit.setImage(file, '#user-cover-image');
            edit.updateUserImage('#cover-image-form');
        });

        $('#current-username').on('keyup', function () {
            let value = $(this).val(),
                helpTextElem = $('#usernameHelp'),
                currentUsername = Application.profile.username,
                formBtn = $('#change-username');

            if (!value.length || (value == currentUsername)) {
                helpTextElem.text(helpTextElem.data('default'));
                formBtn.hide();
                return;
            }

            edit.validateUsername(value);

            formBtn.show();
        });

        $('.profile-page-edit').on('click', '[data-href-target]', function () {
            let loc = $(this).data('href-target'),
                base = '/users/' + (Application.profile.username) + '/edit';
            window.history.pushState(null, '', Application._host + base + loc);
        });
    }

    edit.validateUsername = $.debounce(500, function (username) {
        let helpTextElem = $('#usernameHelp');

        http.GET('/user/validate/username/' + username , {})
                .then(res => {
                    helpTextElem.text(`Cool! People can now mention you with @${username}`)
                        .css({color: 'rgb(98, 98, 98)'}).show();
                })
                .catch(err => {
                    helpTextElem.text(err.message)
                        .css({color: 'red'}).show();
                });
    });

    edit.profileUpdateEvents = function () {
        const {user} = Application;
        $('#profile-update-form').off('submit').on('submit', function (e) {
            e.preventDefault();
            const form = $(this);
            const formData = form.serializeObject();

            form.find('[type="submit"]').attr('disabled', true);
            
            http.PUT(`/user/${user.userid}`, formData)
                .then(res => {
                    const {message} = res;
                    utilities.showToast(message || 'Updated successfully!', 'success');
                })
                .catch(err => {
                    const {message} = err;
                    utilities.showToast(message || 'Something went wrong', 'error');
                })
                .finally(() => {
                    form.find('[type="submit"]').attr('disabled', false);
                })
        });

        $('#change-username-form').on('submit', function(e) {
            e.preventDefault();

            const formData = $(this).serializeObject();
            http.PUT(`/user/${Application.user.userid}/username`, formData)
                .then(res => utilities.showToast(res.message, 'success'))
                .catch(error => utilities.showToast(error.message, 'error'));
        });
    }

    edit.setImage = function (file, targetElem) {
        let reader = new FileReader();
        reader.onload = function () {
            $('body').find(targetElem).attr('src', this.result);
        };
        reader.readAsDataURL(file);
    }

    edit.updateUserImage = function (targetElem) {
        const form = new FormData(document.querySelector(targetElem));
        const csrfToken = String($('form#csrf_token > input').val());
        
        $.ajax({
            url : `/api/v1/user/${Application.user.userid}/picture`,
            type : 'PUT',
            data : form,
            headers: {
                'csrf-token': csrfToken
            },
            processData: false,  // tell jQuery not to process the data
            contentType: false,  // tell jQuery not to set contentType
            enctype: 'multipart/form-data',
            success : function(data) {
                const {payload} = data;
                utilities.showToast(payload.message || 'Updated successfully!', 'success');
            }
        }).catch((err) => {
            let errMessage;
            if (err.responseJSON) {
                errMessage = err.responseJSON.status && err.responseJSON.status.message ?
                    err.responseJSON.status.message :
                    err.responseJSON.error;
            }
            utilities.showToast(errMessage, 'error');
        })
    }

    return edit;
})