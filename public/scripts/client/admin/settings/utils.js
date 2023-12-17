define('client/admin/settings/utils', ['modules/http'], function (http) {
    const utils = {};

    utils.updateSettings = async function (data) {
        try {
            const response = await http.PUT('/api/v1/admin/application/common', JSON.stringify(data), {contentType: 'application/json'});
            if (Object.keys(response).length) {
                Object.assign(Application._config || {}, response);
            }

            utilities.showToast('Data was saved successfully.', 'success');

            return response;
        } catch (err) {
            utilities.showToast(err.message, 'error')
        }
    }

    utils.getEmailTemplateById = async function (id) {
        try {
            return await http.GET('/api/v1/admin/application/email/template/' + id);
        } catch (err) {
            utilities.showToast(err.message, 'error');
        }
    }

    utils.createEmailTemplate = async function (data) {
        try {
            const response = await http.POST('/api/v1/admin/application/email/template', JSON.stringify(data), {contentType: 'application/json'});
            utilities.showToast('Template created successfully!', 'success');

            return response;
        } catch (err) {
            utilities.showToast(err.message, 'error');
        }
    }

    utils.updateEmailTemplate = async function (data, id) {
        try {
            const response = await http.PUT('/api/v1/admin/application/email/template/' + id, JSON.stringify(data), {contentType: 'application/json'});
            utilities.showToast('Template was updated successfully!', 'success');

            return response;
        } catch (err) {
            utilities.showToast(err.message, 'error');
        }
    }

    utils.deleteEmailTemplate = async function (id) {
        try {
            await http.DELETE('/api/v1/admin/application/email/template/' + id);
            utilities.showToast('Template was deleted successfully!', 'success');
        } catch (err) {
            utilities.showToast(err.message, 'error');
        }
    }

    utils.pushEmailByTemplateId = async function (id) {
        try {
            await http.POST('/api/v1/admin/application/email/push/' + id);
            utilities.showToast('Email push successful', 'success');
        } catch (err) {
            utilities.showToast(err.message, 'error');
        }
    }

    return utils;
})