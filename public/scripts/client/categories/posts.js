define('client/categories/posts', ['modules/http', 'client/blog/posts'], function (http, posts) {
    const categoryPosts = {};

    categoryPosts.initialize = function () {
        posts.initialize()
    }

    return categoryPosts;
})