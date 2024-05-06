define('client/blog/posts', ['modules/http'], function (http) {
    const posts = {};

    posts.initialize = function () {
        const {_application} = Application;
        if (_application && Object.keys(_application).length) {
            if (_application.authenticated) {
                posts.attachElevatedEvents();
            }
        }
        
    }

    posts.categoryTemplateFormatOptions = function (data={}) {
        if (!data.id) {
            return data.text;
        }
        
        let $data = $('<span></span>');
        if (data.thumb) {
            $data.append('<img class="img-flag user-img-sm" onerror="core.imageOnError(this)" /> <span></span>')
            $data.find("img").attr("src", data.thumb);
            
        } else {
            $data.addClass('d-flex');
            $data.append('<canvas height="36" width="36" style="border-radius: 36px;"> </canvas> <span class="my-auto ps-2"></span>')
            core.generateAvatarFromName($data.find("canvas"), data.text || data.name);
        }
    
        $data.find("span").text(data.text);
    
        return $data;
    }

    posts.attachElevatedEvents = function () {
        const select2Options = {
            placeholder: 'Select Category...',
            width: '100%',
            dropdownParent: $("#create-post-dialog"),
            templateResult: posts.categoryTemplateFormatOptions,
            templateSelection: posts.categoryTemplateFormatOptions,
            data: Application.categories.map(e => ({id: e.cid, text: e.name})),
            ajax: {
                url: '/api/v1/categories?perPage=5',
                data: function (params) {
                    return {
                        search: params.term,
                    }
                },
                processResults: function (data) {
                    return {
                        results: data.payload.data.map(el => ({
                            ...el,
                            id: el.cid,
                            text: el.name,
                        }))
                    };
                }
            }
        };

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

        $('#category-selection').select2(select2Options);

        $("#tags-selection").select2({
            placeholder: "Enter tags here...",
            width: '100%',
            dropdownParent: $("#add-tags-dialog"),
            delay: 350,
            minimumInputLength: 2,
            ajax: {
                url: function (params) {
                    return '/api/v1/categories/' + $('#category-selection').val() + '/tags/' + params.term;
                },
                data: function (params) {return {}},
                processResults: function (data) {
                    return {
                        results: data.payload.map(el => ({
                            ...el,
                            id: `${el.name}:${el.tagId}`,
                            text: el.name,
                        }))
                    };
                },
                error: function (error) {
                    let {responseJSON} = error;

                    if (responseJSON && responseJSON.status && responseJSON.status.message) {
                        utilities.showToast(responseJSON.status.message, 'error');
                    }
                }
            }
        });

        $('#upload-cover').on('click', function() {
            $('[name="featuredImage"]').trigger('click');
        });

        $('[name="featuredImage"]').on('change', function() {
            let file = this.files[0];
            let filename = '...' + file.name.slice(-9);
            let type = file.type;

            if (!String(type).includes('image')) {
                return utilities.showToast('File must be an image.', 'error');
            }

            $('#cover').text(filename);
            $('#action-container #clear-cover').toggleClass('d-none');
        });

        $('#add-tags').on('click', function() {
            const tags = posts.getSelectedTags();           

            $('#tags-area').empty();
            tags.forEach((tag) =>
				$('#tags-area').append(
					$('<div></div>', {
						class: 'badge badge-light',
						text: '#' + String(tag).split(':').shift(),
					})
				)
			)
        });

        $('#action-container').on('click', '#clear-cover', function() {
            $('#cover').text('Cover Image');
            $('#action-container form').trigger('reset');
            $('#action-container #clear-cover').toggleClass('d-none');
        });

        $('#create-post').on('click', function() {
            let elem = $(this);
            let formData = new FormData($('#post-form')[0]);
            let featuredImage = $('[name="featuredImage"]')[0].files;
            let categories = [$('#category-selection').val()].map(e => 'category:' + e);
            let tags = posts.getSelectedTags();

            categories.forEach((e, i) => formData.append(`categories[${i}]`, e));
            tags.forEach((e, i) => formData.append(`tags[${i}]`, 'tag:' + String(e).split(':').pop()));

            if (featuredImage && featuredImage.length) {
                if (featuredImage[0].type.split('/')[0] == 'image') {
                    formData.append('featuredImage', featuredImage[0]);
                }
            }

            elem.lockWithLoader();
            
            http.POST('/api/v1/blog/', formData, {
                cache: false,
                contentType: false,
                processData: false,
            }).then(res => {
                let slug = res.slug;
                location.href = '/posts/' + slug;
            })
                .catch(err => utilities.showToast(err.message, 'error'))
                .finally(() => elem.unlockWithLoader());
        });

        $('#posts').on('click', '[data-post-action]', function() {
            const target = $(this);
            const postId = target.attr('data-post-id'),
                postAction = target.attr('data-post-action');
            
            http.POST(`/api/v1/blog/posts/${postId}/${postAction}`).then(res => {
                utilities.showToast(res.message, 'success');
                target.parent().find('span').text(res.count);
                target.attr('data-post-action', postAction == 'like' ? 'unlike' : 'like');

                if (postAction == 'like') {
                    target.removeClass('fa-thumbs-o-up').addClass('fa-thumbs-up');
                }
                if (postAction == 'unlike') {
                    target.removeClass('fa-thumbs-up').addClass('fa-thumbs-o-up');
                }
                
            }).catch(err => utilities.showToast(err.message, 'error'));
        });
    }

    posts.getSelectedTags = function() {
        let {tags} = $('#tags-form').serializeObject();
        if (!tags) {
            return [];
        }

        if (typeof tags === 'string') {
            tags = [tags];
        }

        return tags;
    }

    return posts;
})