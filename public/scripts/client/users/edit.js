define('client/users/edit', [], function () {
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
        });

        $('#cover-image').on('change', function () {
            let file = this.files[0];
            edit.setImage(file, '#user-cover-image');
        });
    }

    edit.setImage = function (file, targetElem) {
        let reader = new FileReader();
        reader.onload = function () {
            $('body').find(targetElem).attr('src', this.result);
        };
        reader.readAsDataURL(file);
    }

    return edit;
})