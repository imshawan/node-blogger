/*
 * Copyright (C) 2024 Shawan Mandal <github@imshawan.dev>.
 *
 * Licensed under the GNU General Public License v3, 29 June 2007
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

'use strict';


(function (factory) {
    window.CommentThread = factory();
}(function () {

    class CommentThread {
        
        constructor(options) {
            this.id = this.uuid();
            this.target = $(options.target);
            this.endpoint = options.endpoint || '';
            this.inputPlaceholder = options.inputPlaceholder || 'Add your comment...';
            this.http = options.http || {};
            this.user = options.user || {};
            this.post = options.post || {};
            this.notify = options.notify || this.notifyFn;
            this.container = null;
            this.repliesPerPage = 4;

            this.initialize();
        }

        Icons = {
            liked: 'fa-heart-o',
            like: 'fa-thumbs-o-up',
            reply: 'fa-reply',
            dislike: 'fa-thumbs-down',
            reply: 'fa-reply',
            share: 'fa-share',
            dots: 'fa-ellipsis-h',
            spinner: 'spinner-border',
            up: 'fa-chevron-up'
        }
    
        initialize() {
            if (typeof window.$ === 'undefined' || typeof $ === 'undefined') {
                throw new Error('jQuery is required for CommentThread to initiate.');
            }
            if (!this.target) {
                throw new Error('Target element not specified.');
            }

            this.onLoad();
            this.createLayout();
        }

        uuid () {
            var chars = '0123456789abcdefghijklmnopqrstuvwxyz';
            var uuid = '';
            for (var i = 0; i < 32; i++) {
                var index = Math.floor(Math.random() * chars.length);
                uuid += chars[index];
                if (i === 7 || i === 11 || i === 15 || i === 19) {
                    uuid += '-';
                }
            }
            uuid = uuid.slice(0, 14) + '4' + uuid.slice(15, 3) + 'y' + uuid.slice(19);
            return uuid;
        }

        isAuthor(item) {
            return Number(item.userid) === Number(this.user.userid);
        }

        isHttpReady() {
            return typeof this.http !== undefined && Object.keys(this.http).length;
        }

        notifyFn(message, type) {
            alert(String(type).toUpperCase() + ': ' + message);
        }

        async hitApi(endpoint, method, data) {
            if (!this.isHttpReady()) { return; }
            if (!data || !Object.keys(data).length) {
                data = {};
            }

            return await this.http[String(method).toUpperCase()](endpoint, data);
        }

        async onLoad() {
            const data = await this.hitApi(this.endpoint + `/${this.post.postId}`, 'get');
            this.data = data.data;

            this.hideLoader('loader-' + this.id);

            this.render(this.data)
            this.addEventListeners();
        }

        async onCreate(data) {
            return await this.hitApi(this.endpoint, 'post', data);
        }

        async onDelete(postId, id) {
            return await this.hitApi(this.endpoint + `/${postId}/${id}`, 'delete');
        }

        async onUpdate(id, data) {}

        async handleLike(id) {}

        async loadReplies(postId, commentId) {
            const params = new URLSearchParams({
                id: commentId,
                replies: true,
                perPage: this.repliesPerPage
            })
            const data = await this.hitApi(this.endpoint + `/${postId}?${params.toString()}`, 'get');
            this.render(data.data, this.target.find('.card-comment-' + commentId), true);
        }

        onCancel(id) {
            let target = this.target.find('.input-' + id);
                
            target.css({opacity: 0});
            setTimeout(() => {
                target.remove()
            }, 100);
        }

        setContainer(element) {
            this.container = this.target.find(element);
        }

        components() {
            const $that = this;
            return {
                create(tag='', opts={}) {
                    var element = $('<' + tag + '>', opts);

                    // If there are children, recursively create and append them
                    if (opts.children) {
                        opts.children.forEach((child) => {
                            element.append(child);
                        });
                    }

                    return element;
                },
                subHeader(text='') {
                    return this.create('div', {
                        class: 'd-flex mb-2 mt-5',
                        children: [
                            this.create('h5', {text, class: 'text-capitalize'})
                        ]
                    })
                },
                loader(id='') {
                    return this.create('div', {
                        class: 'd-flex justify-content-center align-items-center',
                        id: 'loader-' + (id || $that.id),
                        children: [
                            this.create('i', {class: $that.Icons.spinner})
                        ]
                    })
                },
                commentInput(data={}, css={}, allowCancellation=false, fadeIn=false) {
                    if (!data || typeof data !== 'object' || !Object.keys(data).length) {
                        data = {commentId: $that.id}
                    }
                    let transition = {
                        opacity: 0,
                        transition: 'opacity 0.2s ease-in-out',
                    }
                    return this.create('div', {
                        class: 'input-' + data.commentId,
                        css: $.extend(fadeIn ? transition : {}, (css || {})),
                        children: [
                            this.create('textarea', {rows: 3, id: 'textarea-' + data.commentId, class: 'p-3', placeholder: $that.inputPlaceholder}).css({width: '100%', fontSize: 'var(--font-size-14)'}),
                            this.create('div', {
                                children: [this.commentButton(data.commentId, allowCancellation).css({marginTop: '8px'})],
                                class: 'd-flex justify-content-end'
                            })
                        ],
                    })
                },
                commentButton(id, allowCancellation) {
                    if (!id) {
                        id = $that.id;
                    }

                    const createBtn = this.create('button', {text: 'Comment', class: 'button create-comment', 'data-id': id});
                    if (!allowCancellation) {
                        return createBtn;
                    }

                    return this.create('div', {
                        children: [
                            this.create('button', {text: 'Cancel', class: 'button-outlined cancel-comment', 'data-id': id, css: {marginRight: '8px'}}),
                            createBtn,
                        ]
                    });
                },
                author (data={}) {
                    return this.create('div', {
                        class: 'me-3',
                        children: [
                            this.create('img', {
                                src: data.picture || 'https://t3.ftcdn.net/jpg/03/58/90/78/360_F_358907879_Vdu96gF4XVhjCZxN2kCG0THTsSQi8IhT.jpg',
                                css: {height: '50px', width: '50px', borderRadius: '50%'},
                            })
                        ]
                    });
                },
                dropdown(data={}) {
                    return this.create('div', {
                        class: 'dropdown',
                        children: [
                            this.create('button', {
                                class: 'border-0 bg-transparent px-2',
                                type: 'button',
                                'data-bs-toggle': 'dropdown',
                                'aria-expanded': 'false',
                                children: [
                                    this.create('i', {class: 'fa ' + $that.Icons.dots})
                                ]
                            }),
                            this.create('ul', {
                                class: 'dropdown-menu shadow border',
                                children: [
                                    this.create('li', {
                                        children: [
                                            this.create('a', {
                                                class: 'dropdown-item',
                                                text: 'Edit',
                                                'data-owner-action': 'edit',
                                                'data-id': data.commentId
                                            })
                                        ]
                                    }),
                                    this.create('li', {
                                        children: [
                                            this.create('a', {
                                                class: 'dropdown-item',
                                                text: 'Delete',
                                                'data-owner-action': 'delete',
                                                'data-id': data.commentId
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    });
                },
                actionBar(data={}, enableReply) {
                    return this.create('div', {
                        class: 'd-flex mt-3 justify-content-between',
                        children: [
                            this.create('div', {
                                class: 'd-flex',
                                children: [
                                    this.create('div', {
                                        css: {fontSize: 'var(--font-size-14)'},
                                        children: [
                                            this.create('span', {text: (data.likes || 0) + ' likes'})
                                        ]
                                    }),
                                    enableReply && this.create('div', {
                                        class: 'ms-3 me-2',
                                        css: {fontSize: 'var(--font-size-14)'},
                                        children: [
                                            this.create('i', {
                                                class: 'fa ' + $that.Icons.reply
                                            }),
                                            this.create('span', {
                                                text: 'Reply',
                                                
                                                class: 'text-black-50 mx-2 cursor-pointer',
                                                'data-reply-id': data.commentId,
                                                'data-parent': data.parent
                                            })
                                        ]
                                    }),
                                    data.replies > 0 && this.create('div', {
                                        css: {fontSize: 'var(--font-size-14)'},
                                        children: [
                                            this.create('span', {
                                                text: `Replies (${data.replies})`,
                                                class: 'text-black-50 cursor-pointer view-replies',
                                                'data-comment-id': data.commentId,
                                            })
                                        ]
                                    })
                                ]
                            }),
                            this.create('div', {
                                children: [
                                    this.create('i', {
                                        css: {fontSize: 'var(--font-size-14)'},
                                        class: 'cursor-pointer me-1 fa ' + $that.Icons.like,
                                        'data-post-action': 'like', 'data-comment-id': data.commentId
                                    }),
                                ]
                            })
                        ]
                    });
                },
                hideReplies(id) {
                    return this.create('div', {
                        class: 'd-flex justify-content-center',
                        children: [
                            this.create('div', {
                                css: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                },
                                class: 'cursor-pointer hide-replies',
                                children: [
                                    this.create('i', {
                                        class: 'fa ' + $that.Icons.up
                                    }),
                                    this.create('span', {
                                        text: 'Hide replies',
                                        class: 'text-black-50 cursor-pointer',
                                        css: {fontSize: 'var(--font-size-14)'}
                                    })
                                ],
                                'data-comment-id': id,
                            })
                        ]
                    })
                },
                comment (data={}, enableReply=true) {
                    return this.create('div', {
                        id: 'comment-' + data.commentId,
                        class: 'd-flex w-100 my-2',
                        children: [
                            this.create('div', {
                                class: 'w-100 card border-0',
                                children: [
                                    this.create('div', {
                                        class: 'card-body card-comment-' + data.commentId,
                                        children: [
                                            this.create('div', {
                                                class: 'd-flex justify-content-between',
                                                children: [
                                                    this.create('div', {
                                                        class: 'd-flex',
                                                        children: [
                                                            this.author(data.author || {}),
                                                            this.create('div', {
                                                                children: [
                                                                    this.create('div', {
                                                                        text: data.author.fullname || data.author.username, class: 'text-black', 
                                                                        css: {
                                                                            fontSize: 'var(--font-size-16)',
                                                                            fontWeight: '500'
                                                                        }
                                                                    }),
                                                                    this.create('div', {text: data.createdAt, class: 'mt-0', css: {
                                                                        fontSize: 'var(--font-size-12)',
                                                                        color: 'var(--color-black-50)',
                                                                    }}),
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    $that.isAuthor(data.author) && this.dropdown(data)
                                                ]
                                            }),
                                            
                                            this.create('div', {
                                                text: data.content,
                                                class: 'text-black-50',
                                                css: {
                                                    marginTop: '8px',
                                                    fontSize: 'var(--font-size-14)'
                                                }
                                            }),
                                            this.actionBar(data, enableReply),
                                        ]
                                    })
                                ]
                            })
                        ],
                    })
                }
            };
        }

        createComment(data={}) {
            const components = this.components();
            const isReply = Boolean(data.parent);

            // Creating an ease in transition
            let commentComponent = components.comment({...data, ...(isReply ? {commentId: this.uuid()} : {})}, !isReply).css({
                    opacity: 0,
                    transition: 'opacity 0.5s ease-in-out',
                    ...(isReply ? {paddingLeft: '1.5rem'} : {})
                });

            if (!isReply) {
                this.target.find('#comments-' + this.id).prepend(commentComponent);
            } else {
                let target = this.target.find('#comment-' + data.parent).find('.card-body');

                // Remove the comment input text area
                this.onCancel(data.parent);

                // Remove the margins
                commentComponent.removeClass('my-2');
                commentComponent.find('.card-body').css({paddingRight: 0});

                if (!target.find('.replies').length) {
                    target.append(components.create('div', {
                        class: 'replies my-2',
                        children: [
                            commentComponent
                        ]
                    }));
                } else {
                    target.find('.replies').append(commentComponent);
                }
            }

            // Let the element get appended in the dom and than the opacity to complete the transition
            setTimeout(() => this.target.find('#' + commentComponent.attr('id')).css({opacity: 1}), 100);

            this.onCreate(data)
                .then((res) => {
                    !isReply && this.target.find('#textarea-' + data.commentId).val('');
                    console.log(res)
                })
                .catch((err) => {
                    this.notify(err.message, 'error');
                    this.target.find('#comment-' + data.commentId).remove();
                });
        }

        addEventListeners() {
            const $that = this,
                components = this.components();

            this.target.off('click').on('click', '[data-post-action]', function() {
                console.log('Like button clicked', $(this));
            });

            // Triggered when a user wants to reply to an existing comment
            this.target.on('click', '[data-reply-id]', function() {
                const {replyId, parent} = $(this).data();
                let $target = $that.target.find('#comment-' + replyId);
                
                $target.find('.card-comment-' + replyId).append(components.commentInput({commentId: replyId}, {marginTop: '.4rem'}, true, true));
                setTimeout(() => {
                    $that.target.find('.input-' + replyId).css({opacity: 1});
                }, 100);
            });

            // triggered on view replies for a particular comment
            this.target.on('click', '.view-replies', function() {
                const {commentId} = $(this).data();
                const loader = components.loader(commentId);
                let target = $that.target.find('.card-comment-' + commentId);
                
                target.append(loader.css({height: '200px'}))

                $that.loadReplies($that.post.postId, commentId).then(() => target.find($(loader)).remove())
            });

            this.target.on('click', '[data-owner-action]', function() {
                const { ownerAction, id } = $(this).data();
                let target = $that.target.find('#comment-' + id);
                let postId = $that.post.postId;
                
                if (ownerAction == 'delete') {
                    if (confirm('Are you sure to delete this comment?')) {
                        target.css({opacity: 0});

                        // If API call is success than delete it from DOM, or else bring it back if error
                        $that.onDelete(postId, id).then(res => target.remove())
                            .catch(err => {
                                $that.notify(err.message, 'error');
                                target.css({opacity: 1});
                            });
                    }
                }
            });

            this.target.on('click', '.cancel-comment', function() {
                const { id } = $(this).data();
                $that.onCancel(id);
            });

            this.target.on('click', '.create-comment', function() {
                const {id} = $(this).data();
                let content = $that.target.find('#textarea-' + id).val();

                /**
                 * @var {boolean} isReply
                 * @description If id is a number, means we are replying to an existing comment (as commentId is a number).
                 * The master comment textbox has id which is alphanumeric.
                 */
                let isReply = !isNaN(id);

                if (!content || content.length < 3) return $that.notify('Please write a comment first', 'error');

                let data = {
                    postId: $that.post.postId,
                    content,
                    author: $that.user,
                    createdAt: new Date().toISOString(),
                    likes: 0,
                    replies: 0
                };

                if (isReply) {
                    data.parent = id;
                    data.commentId = id;
                }

                $that.createComment(data);
            });

            this.target.on('click', '.hide-replies', function() {
                const {commentId} = $(this).data();
                let target = $that.target.find('.card-comment-' + commentId).find('.replies')

                target.css({opacity: 0});
                setTimeout(() => {
                    target.remove()
                }, 350);
            });
        }

        hideLoader(id) {
            this.target.find('#' + id).removeClass('d-flex').hide();
        }

        createLayout() {
            const $that = this;
            const components = this.components();
            const container = '#comments-' + $that.id;

            this.target.append(
                components.create('div', {
                    children: [
                        components.create('div', {
                            id: 'comments-' + $that.id,
                            class: 'mt-3',
                            children: [
                                components.loader()
                            ]
                        }),
                        components.subHeader('Leave a Comment'),
                        components.commentInput(),
                    ],
                    css: {
                        width: '100%'
                    }
                })
            );

            this.setContainer(container);
        }

        render(data=[], target=this.container, replies=false) {
            const components = this.components();
            const css = {
                opacity: 0,
                transition: 'opacity 0.5s ease-in-out',
                paddingLeft: '1.5rem'
            };
            let parent = 0;

            const comments = data.map(c => {
                let comment = components.comment(c);
                
                !parent && (parent = c.parent)

                if (replies) {
                    comment.find('.card-body').css({paddingRight: 0});
                    comment.removeClass('my-2');
                    
                    return comment;
                }

                return components.create('div', {
                    id: 'comment-' + c.commentId,
                    children: [comment]
                })
            });

            if (replies) {
                if (!target.find('.replies').length) {
                    target.append(components.create('div', {
                        class: 'replies my-2',
                        css: css,
                        children: comments.concat(components.hideReplies(parent))
                    }));
                } else {
                    target.find('.replies').append(comments);
                }

                return setTimeout(() => {
                    target.find('.replies').css({opacity: 1})
                }, 100);
            }

            target.prepend(comments);
        }
    }
    
    return CommentThread;
}));