define('client/users/profile', ['modules/http'], function (http) {
    const profile = {};

    profile.initialize = function () {
        this.attachPageEvents();
    }

    profile.attachPageEvents = function () {

        $('body').on('click', '[data-action]', function () {
            const btn = $(this),
                action = btn.attr('data-action');

            if (action == 'unfollow') {
                return profile.handleUnfollow(btn);
            }

            profile.updateFollowing(btn);
            
        });
    }

    profile.updateFollowing = function (targetElem) {
        const userId = targetElem.attr('data-userid'),
            action = targetElem.attr('data-action'),
            endPoint = `/user/${userId}/${action}`;

        let toggled = this.toggleAction(action),
            label = toggled == 'follow' ? 'Follow ' : 'Following ',
            icon = toggled == 'follow' ? 'fa-plus ' : 'fa-check';

        http.PUT(endPoint, {}).then((res) => {
            utilities.showToast(res.message, 'success');

            targetElem.attr('data-action', toggled).empty().append(
                $('<span>').text(label),
                $('<i>', {class: 'fa-fa fa-solid ' + icon}),
            );
        }).catch(err => utilities.showToast(err.message, 'error'));
    }

    profile.handleUnfollow = function(targetElem) {
        const name = targetElem.attr('data-user-name');

        var dialog = bootbox.dialog({
            message: `<div class="text-black">Are you sure to unfollow <span class="font-italic">"${name}"?</span></div>`,
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
                    className: 'btn-dark px-4',
                    callback: function(){
                        profile.updateFollowing(targetElem);
                    }
                }
            },
        });
    }

    profile.toggleAction = function(action){
        const actions = ['follow', 'unfollow'];
        let toggled = actions.filter(item => item != action);
        
        return toggled.length && toggled[0];
    }

    return profile;
})