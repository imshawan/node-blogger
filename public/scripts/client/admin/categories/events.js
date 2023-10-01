define('client/admin/categories/events', [], function () {
    const events = {};

    events.initialize = function () {
        $('#upload-category-image').off('click').on('click', function () {
            $('#category-image').trigger('click');
        });

        $('#category-image').on('change', function () {
            const imageInput = $(this)[0];

            if (imageInput && imageInput.files && imageInput.files.length) {
                const file = imageInput.files[0];

                if (file.type.split('/')[0] != 'image') {
                    return core.alertError('File must be an image');
                }

                const base64Image = URL.createObjectURL(file);
                $("#categoryimage").attr("src", base64Image);
            }

        });
    }

    return events;
});