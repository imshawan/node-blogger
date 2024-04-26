define('client/users/delete', ['modules/http'], function (http) {
    const deleteModule = {};

    deleteModule.perform = (user) => {
        let fullname = user.fullname || user.username;

        var dialog = bootbox.dialog({
            title: `<div class="text-normal">Are you sure you want to permanently delete your account, <span class="font-italic">${fullname}</span>?</div>`,
            message: deleteModule.getDeletionMessage(fullname),
            closeButton: false,
            buttons: {
                cancel: {
                    label: "Cancel",
                    className: 'button-outlined',
                    callback: function(){
                        dialog.hide('modal');
                    }
                },
                ok: {
                    label: "Ok",
                    className: 'btn-danger btn-border-2-danger px-4',
                    callback: function(){
                        deleteModule.deleteUser(user.userid);
                    }
                }
            },
        });
    };

    deleteModule.deleteUser = function (userid) {
        console.log('Trigger delete for ', userid);
    }

    deleteModule.getDeletionMessage = function (fullname) {
        return `
            <p>This action will permanently the account and all their associated content from the platform. </p>
            <p>${deleteModule.getDeletionPointers(fullname)}</p>
            <p><span class="text-danger font-weight-semibold">Warning!</span> This process cannot be undone. Please ensure that you have carefully reviewed the consequences before proceeding with this action.</p>
        `
    }

    deleteModule.getDeletionPointers = function (fullname) {
        fullname = `<span class="font-monospace font-weight-semibold">${fullname}</span>`;
        return `
            <ul>
                <li>All content, posts, comments, replies, messages, for ${fullname} will be deleted and cannot be recovered.</li>
                <li>Any traces of the user's activity on the platform, such as likes, dislikes, or follows, will be removed.</li>
                <li>Other users who interacted with the ${fullname} may lose access to past conversations or collaborations.</li>
            </ul>
        `
    }

    return deleteModule;
});