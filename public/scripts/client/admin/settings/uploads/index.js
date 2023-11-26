define('client/admin/settings/uploads/index', ['client/admin/settings/utils'], function (utils) {
    const uploads = {};

    uploads.initialize = function () {

        $('#files-settings').dirrty();
        
        $("#filetype-selection").select2({
            placeholder: "Pick extensions",
            width: '100%',
            tags: true,
        });

        $('#save').on('click', function () {
            const data = $('#files-settings').serializeObject();
            Object.keys(data).forEach(field => {
                if (!isNaN(String(data[field]))) {
                    data[field] = Number(data[field]);
                }
            });
            
            $.each($('#files-settings input[type="checkbox"]'), function (i, e) {
                data[e.name] = $(e).is(':checked');
            });

            utils.updateSettings(data).then(() => {
                $('#files-settings').dirrty('setClean');
            });

        });
    }

    return uploads;
})