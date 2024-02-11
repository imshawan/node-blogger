define('client/admin/categories/utils', ['modules/http'], function (http) {
    const utils = {};

    utils.select2TemplateFormatOptions = function (data) {
        if (!data.id) {
            return data.text;
        }
        
        let $data = $('<span></span>');
        if (data.thumb) {
            $data.append('<img class="img-flag user-img-sm" onerror="core.imageOnError(this)" /> <span></span>')
            $data.find("img").attr("src", data.thumb);
            
        } else {
            $data.addClass('d-flex');
            $data.append('<canvas height="36" width="36" style="border-radius: 36px;"> </canvas> <span class="my-auto ps-1"></span>')
            core.generateAvatarFromName($data.find("canvas"), data.text || data.name);
        }
    
        $data.find("span").text(data.text);
    
        return $data;
    }

    utils.deleteCategory = function (id) {
        http.DELETE('/api/v1/admin/categories/' + id).then(res => {
            const callback = () => location.href = [location.origin, 'admin', 'manage', 'categories'].join('/');

            core.alertSuccess('Category deleted!', callback);

        }).catch(err => {
            core.alertError(err.message);
        });
    }

    utils.getDeletionMessage = function (category) {
        return `
        <p>This action will permanently remove all its associated content, posts, subcategories, and tags from the platform.</p>
        <p>${utils.getDeletionPointers(category)}</p>
        <p><span class="text-danger font-weight-semibold">Warning!</span> This process cannot be undone. Please ensure that you have carefully reviewed the consequences before proceeding with this action.</p>
        `
    }

    utils.getDeletionPointers = function (category) {
        let {name} = category;
        name = `<span class="font-monospace font-weight-semibold">${name}</span>`;
        return `
            <ul>
                <li>All content, including posts, sub-categories and media, within ${name} will be deleted and cannot be recovered. This would impact the discoverability of content.</li>
                <li>Users who have engaged with the category will lose access to their contributions, and ongoing discussions will be terminated.</li>
            </ul>
        `
    }

    return utils;
});