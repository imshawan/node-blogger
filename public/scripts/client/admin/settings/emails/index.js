define('client/admin/settings/emails/index', ['client/admin/settings/utils'], function (utils) {
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