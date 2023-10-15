define('client/admin/settings/site/index', ['modules/http'], function (http) {
    const site = {};

    site.initialize = function () {
        
        $("#site-keywords").select2({
            placeholder: "Enter keywords...",
            width: '100%',
            tags: true,
        });

        $('#favicon-upload-input').on('change', function () {
            let files = this.files;
            site.handleImageTypeUpdates(files,  'favicon');
        });

        $('#logo-upload-input').on('change', function () {
            let files = this.files;
            site.handleImageTypeUpdates(files,  'logo');
        });
    }

    site.handleImageTypeUpdates = function (files, imageType) {
        if (files && files.length) {
            files = files[0];
            $(`#${imageType}-upload-info`).val(files.name);
            $(`#${imageType}-upload-btn`).lockWithLoader();
            console.log($(`#${imageType}-upload-btn`), `#${imageType}-upload-btn`)

            let formData = new FormData();
            let endpoint = '/api/v1/admin/settings/site/' + imageType;
            formData.append(imageType, files);

            site.uploadImage(endpoint,  'post', formData, () => {
                core.alertSuccess('Updated!');
                $(`#${imageType}-upload-btn`).unlockWithLoader();
            })
        }
    }

    site.uploadImage = function (endpoint, method, formData, callback) {
        http[method.toUpperCase()](endpoint, formData, {
            cache: false,
            contentType: false,
            processData: false,
        }).then(res => {
            if (callback && typeof callback === 'function') {
                callback();
            }
        }).catch(err => {
            core.alertError(err.message);
        });
    }

    return site;
})