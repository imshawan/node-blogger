define('client/blog/single', ['modules/comments', 'modules/http'], function (c, http) {
    const single = {};

    single.initialize = function () {
        if (window.CommentThread && typeof window.CommentThread === 'function') {
            new window.CommentThread({
                target: '#comments-section',
                user: Application.user ||  {},
                endpoint: '/api/v1/comment',
                post: Application.post,
                notify: utilities.showToast,
                http,
            });
        }
    }

    return single;
})