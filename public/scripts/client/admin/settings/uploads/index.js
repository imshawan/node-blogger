define('client/admin/settings/uploads/index', ['client/admin/settings/utils'], function (utils) {
    const uploads = {};

    uploads.initialize = function () {

        $('#files-settings').dirrty();
        $('#photo-settings').dirrty();
        $('#profile-image-settings').dirrty()
        
        $("#filetype-selection").select2({
            placeholder: "Pick extensions",
            width: '100%',
            tags: true,
        });

        $('#enableImageResize').on('change', function () {
            uploads.handleResizeImageParams(!$(this).is(':checked'));
        });

        $('#save').on('click', function () {
            let data = $.extend(
                $('#files-settings').serializeObject(), 
                $('#photo-settings').serializeObject(), 
                $('#profile-image-settings').serializeObject());

            Object.keys(data).forEach(field => {
                if (!isNaN(String(data[field]))) {
                    data[field] = Number(data[field]);
                }
            });
            
            data = $.extend(data,
                uploads.getCheckedValuesBySelector('#files-settings'),
                uploads.getCheckedValuesBySelector('#profile-image-settings'),
                uploads.getCheckedValuesBySelector('#photo-settings'))

            utils.updateSettings(data).then(() => {
                $('#files-settings').dirrty('setClean');
                $('#photo-settings').dirrty('setClean');
                $('#profile-image-settings').dirrty('setClean')
            });

        });
    }

    uploads.getCheckedValuesBySelector = function (selector) {
        const data = {};
        $.each($(selector + ' input[type="checkbox"]'), function (i, e) {
            data[e.name] = $(e).is(':checked');
        });

        return data;
    }

    uploads.handleResizeImageParams = function (disable) {
        $.each($('#image-resize-params input'), function (i, e) {
            $(e).attr('disabled', disable);
        });
    }

    return uploads;
})