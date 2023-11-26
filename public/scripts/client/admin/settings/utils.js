define('client/admin/settings/utils', ['modules/http'], function (http) {
    const utils = {};

    utils.updateSettings = async function (data) {
        try {
            const response = await http.PUT('/api/v1/admin/application/common', JSON.stringify(data), {contentType: 'application/json'});
            if (Object.keys(response).length) {
                Object.assign(Application._config || {}, response);
            }

            utilities.showToast('Data was saved successfully.', 'success');
        } catch (err) {
            utilities.showToast(err.message, 'error')
        }
    }

    return utils;
})