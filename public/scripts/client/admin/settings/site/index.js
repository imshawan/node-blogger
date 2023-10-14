define('client/admin/settings/site/index', ['modules/http'], function (http) {
    const site = {};

    site.initialize = function () {
        
        $("#site-keywords").select2({
            placeholder: "Enter keywords...",
            width: '100%',
            tags: true,
        });

        $('#file-upload-input').on('change', function () {
            let files = this.files;
            if (files && files.length) {
                files = files[0];
                $('#file-upload-info').val(files.name);
                $('#file-upload-btn').lockWithLoader();

                let formData = new FormData();
                formData.append('logo', files);

                site.uploadImage('/api/v1/admin/settings/site/logo',  'post', formData, () => {
                    core.alertSuccess('Updated!');
                    $('#file-upload-btn').unlockWithLoader();
                })
            }
        });
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