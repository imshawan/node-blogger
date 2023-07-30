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
    }

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
                    alertSuccess(message || 'Updated successfully!');
                })
                .catch(err => {
                    const {message} = err;
                    alertError(message || 'Updated successfully!');
                })
                .finally(() => {
                    form.find('[type="submit"]').attr('disabled', false);
                })
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
                alertSuccess(payload.message || 'Updated successfully!');
            }
        }).catch((err) => {
            let errMessage;
            if (err.responseJSON) {
                errMessage = err.responseJSON.status && err.responseJSON.status.message ?
                    err.responseJSON.status.message :
                    err.responseJSON.error;
            }
            alertError(errMessage);
        })
    }

    return edit;
})