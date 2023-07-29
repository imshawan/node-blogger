define('client/users/edit', ['modules/http'], function () {
    const edit = {};

    edit.initialize = function () {
        this.attachPageEvents();
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
        console.log(...form)
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
                const {response} = data;
                alertSuccess(response.message || 'Updated successfully!');
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