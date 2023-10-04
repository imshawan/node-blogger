define('client/admin/categories/utils', [], function () {
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

    return utils;
});