define('client/admin/settings/site/index', ['modules/http'], function (http) {
    const site = {};
    var dataChanged = {};

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

        $('#site-config').dirrty();

        $('input,textarea').on('keyup', function (e) {
            if (e.target.name) {
                dataChanged[e.target.name] = e.target.value;
            }
        });

        $('input[type="checkbox"]').on('change', function (e) {
            if (e.target.name) {
                dataChanged[e.target.name] = $(e.target).is(':checked');
            }
        });

        $('#save-site-information').on('click', function () {
            const keywordsSelector = $('#site-keywords');
            if (keywordsSelector.data('is-dirrty')) {
                dataChanged[keywordsSelector.attr('name')] = keywordsSelector.val();
            }

            if (!Object.keys(dataChanged).length) return utilities.showToast('Nothing to save, as no changes were made.');

            http.PUT('/api/v1/admin/application/common', dataChanged)
                .then(res => {
                    $('#site-config').dirrty('setClean');
                    dataChanged = {};

                    if (Object.keys(res).length) {
                        Object.assign(Application._config || {}, res);
                    }

                    utilities.showToast('Data was saved successfully.', 'success');
                })
                .catch(err => utilities.showToast(err.message, 'error'));
        });
    }

    site.handleImageTypeUpdates = function (files, imageType) {
        if (files && files.length) {
            files = files[0];
            $(`#${imageType}-upload-info`).val(files.name);
            $(`#${imageType}-upload-btn`).lockWithLoader();
            console.log($(`#${imageType}-upload-btn`), `#${imageType}-upload-btn`)

            let formData = new FormData();
            let endpoint = '/api/v1/admin/application/site/' + imageType;
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