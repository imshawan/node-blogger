define('client/admin/settings/emails/index', ['client/admin/settings/utils', 'modules/http'], function (utils, http) {
    const emails = {};

    emails.initialize = function () {
        const {data} = Application;

        // this.initializeEditor();
        this.attchEvents();

        if (data.emailServiceAuthenticationType) {
            this.handleAuthForm(data.emailServiceAuthenticationType);
        }
    }

    emails.attchEvents = function () {
        $('#email-basic-settings').dirrty();
        $('#email-smtp-settings').dirrty();

        $('#auth-selection').on('change', function() {
            emails.handleAuthForm($(this).val());
        });

        $('[name="emailService"]').on('change', function () {
            const val = $(this).val();
            if (val == 'custom') {
                $('#service-conf').trigger('click');
            }
        })

        $('#edit-template').on('click', function() {
            emails.initializeEditor(null, 'edit-template-code');
        });

        $('#create-template').on('click', function() {
            emails.initializeEditor(null, 'new-template-code');
        });

        $('#save').on('click', function () {
            const data = $.extend(
                $('#email-basic-settings').serializeObject(), 
                $('#email-smtp-settings').serializeObject());

            utils.updateSettings(data).then(() => {
                $('#email-basic-settings').dirrty('setClean');
                $('#email-smtp-settings').dirrty('setClean');
            });

        });

        $('#new-template-modal-form').on('submit', function (e) {
            e.preventDefault();
            const form = $(this);
            const data = form.serializeObject();
            const html = window.editor && window.editor.getValue();

            if (!html) {
                return utilities.showToast('Email template HTML cannot be blank.', 'error');
            }

            data.html = html;

            utils.createEmailTemplate(data).then((template) => {
                $('#close-create-modal').trigger('click');
                $('#template-selection').prepend($('<option>').attr('value', template.templateId).text(template.name));
            });

        });

        $('#service-form').on('submit', function (e) {
            e.preventDefault();
            const form = $(this);
            const formData = form.serializeObject();

            form.find('[type="submit"]').lockWithLoader();

            http.PUT('/api/v1/admin/application/email/service', formData)
                .then(res => {
                    utilities.showToast('Service saved successfully.', 'success');

                    $('#emailServiceUsername').val(formData.username);
                    $('#emailServicePassword').val(formData.password);
                    $('#auth-selection').find('option[value="default"]').attr('selected', true);
                    $('#emailServiceApiKey').attr('disabled', true);
                    
                    $('#service-modal button[data-bs-dismiss="modal"]').trigger('click');
                })
                .catch(err => utilities.showToast(err.message, 'error'))
                .finally(() => form.find('[type="submit"]').unlockWithLoader());
        });

        $('#save-template').on('click', function () {
            $(this).lockWithLoader();

            const target = $(this);
            const id = target.parent().data('template-id');
            const data = {
                name: $('#template-name').val(),
                html: window.editor && window.editor.getValue(),
            }

            utils.updateEmailTemplate(data, id).then((template) => {
                $('#close-edit-modal').trigger('click');
                $('#template-selection').find(`option[value="${id}"]`).text(template.name);

                target.unlockWithLoader();
            });
        });

        $('body').on('click', '#edit-template', function () {
            const selectedTemplateId = $('#template-selection').val();
            utils.getEmailTemplateById(selectedTemplateId).then((template) => {
                $('#template-name').val(template.name);
                $('#template-form-actions').attr('data-template-id', template.templateId);

                window.editor && window.editor.setValue(template.html);
            });
        });

        $('#delete-template').on('click', function () {
            const target = $(this);
            const id = $(this).parent().data('template-id');

            if (!confirm('Are you sure to DELETE this template?')) return;

            target.lockWithLoader();

            utils.deleteEmailTemplate(id).then(() => {
                $('#close-edit-modal').trigger('click');
                $('#template-selection').find(`option[value="${id}"]`).remove();

                target.unlockWithLoader();
            });
        });

        $('#push-test-email').on('click', function () {
            const target = $(this);
            const templateId = $('#template-selection').val();

            target.lockWithLoader();
            
            utils.pushEmailByTemplateId(templateId).then(() => {
                target.unlockWithLoader();
            })
        });
    }

    emails.handleAuthForm = function (selected) {
        const {emailServiceAuthenticationTypes} = Application;
        const types = Object.keys(emailServiceAuthenticationTypes);

        types.forEach(type => {
            $.each($(`#${type}-auth input`), function(i, e) {
                $(e).attr('disabled', selected != type)
            });
        });
    }

    emails.initializeEditor = function (code='', id="editor") {
        if (window.hasOwnProperty('editor') && typeof window.editor == 'object') {
            window.editor.destroy();
        }

        const editor = ace.edit(id);
        editor.setTheme("ace/theme/one_dark");
        editor.session.setMode("ace/mode/html");
        editor.setShowPrintMargin(false);
        editor.setFontSize(14)

        if (code && code.length) {
            editor.setValue(code, 1);
        }

        window.editor = editor;
    }

    return emails;
})