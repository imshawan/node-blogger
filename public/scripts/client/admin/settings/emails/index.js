define('client/admin/settings/emails/index', ['client/admin/settings/utils'], function (utils) {
    const emails = {};

    emails.initialize = function () {
        const {data} = Application;

        this.initializeEditor();

        $('#email-basic-settings').dirrty();
        $('#email-smtp-settings').dirrty();

        if (data.emailServiceAuthenticationType) {
            this.handleAuthForm(data.emailServiceAuthenticationType);
        }

        $('#auth-selection').on('change', function() {
            emails.handleAuthForm($(this).val());
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

    emails.initializeEditor = function (code='') {
        if (window.hasOwnProperty('editor') && typeof window.editor == 'object') {
            window.editor.destroy();
        }

        const editor = ace.edit("editor");
        editor.setTheme("ace/theme/one_dark");
        editor.session.setMode("ace/mode/html");
        editor.setShowPrintMargin(false);

        if (code && code.length) {
            editor.setValue(code, 1);
        }

        window.editor = editor;
    }

    return emails;
})