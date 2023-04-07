define('client/blog/create', [], function () {
    const create = {};

    create.initialize = function () {
        $('#summernote').summernote({
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
    }

    return create;
})