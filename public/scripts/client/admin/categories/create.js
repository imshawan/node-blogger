define('client/admin/categories/create', [], function () {
    const create = {};

    create.initialize = function () {
        const {category} = pagePayload;
        generateAvatarFromName('category-icon');
    }

    return create;
})