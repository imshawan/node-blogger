define('client/blog/posts', ['modules/http'], function (http) {
    const posts = {};

    posts.initialize = function () {

        $('#editorarea').summernote({
            branding: false,
            placeholder: 'You can write your post here, drag images and much more...',
            tabsize: 2,
            height: 400,
            width: '100%',
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'underline', 'clear']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['table', ['table']],
                ['insert', ['link', 'picture']],
                ['view', ['fullscreen', 'codeview', 'help']]
            ]
        });

        $('#post-title').on('keyup', function () {
            let val = $(this).val();
            let elem = $('#post-title-label');
            if (val.length) {
                elem.addClass('d-none');
            } else {
                elem.removeClass('d-none');
            }
        });

        $("#tags-selection").select2({
            placeholder: "Tags (Optional)",
            width: '100%',
            tags: true,
        });

        $('#create-post').on('click', function() {
            let data = $('#post-form').serializeObject();
            
            http.POST('/api/v1/blog/', data).then(res => {})
                .catch(err => {});
        });
    }

    return posts;
})