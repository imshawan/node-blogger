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
            this.data = options.data || [];
            this.user = options.user || {};
            this.post = options.post || {};
            this.notify = options.notify || this.notifyFn;

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
        }
    
        initialize() {
            if (typeof window.$ === 'undefined' || typeof $ === 'undefined') {
                throw new Error('jQuery is required for CommentThread to initiate.');
            }
            if (!this.target) {
                throw new Error('Target element not specified.');
            }

            this.target.append(this.render(this.data));
            this.addEventListeners();
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
            return typeof http !== undefined && Object.keys(http).length;
        }

        notifyFn(message, type) {
            alert(String(type).toUpperCase() + ': ' + message);
        }

        async hitApi(endpoint, method, data) {
            if (!this.isHttpReady()) { return; }

            return await http[method](endpoint, data);
        }

        async onCreate(data) {}

        async onDelete(id) {}

        async onUpdate(id, data) {}

        async handleLike(id) {}

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
                commentInput(data={}) {
                    if (!data || typeof data !== 'object' || !Object.keys(data).length) {
                        data = {id: $that.id}
                    }
                    
                    return this.create('div', {
                        id: 'input-' + data.id,
                        children: [
                            this.create('textarea', {rows: 3, id: 'textarea-' + data.id, class: 'p-3', placeholder: $that.inputPlaceholder}).css({width: '100%'}),
                            this.create('div', {
                                children: [this.commentButton().css({marginTop: '8px'})],
                                class: 'd-flex justify-content-end'
                            })
                        ],
                    })
                },
                commentButton(id) {
                    if (!id) {
                        id = $that.id;
                    }
                    return this.create('button', {text: 'Comment', class: 'button create-comment', 'data-id': id});
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
                                                'data-id': data.id
                                            })
                                        ]
                                    }),
                                    this.create('li', {
                                        children: [
                                            this.create('a', {
                                                class: 'dropdown-item',
                                                text: 'Delete',
                                                'data-owner-action': 'delete',
                                                'data-id': data.id
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    });
                },
                actionBar(data={}) {
                    return this.create('div', {
                        class: 'd-flex mt-3 justify-content-between',
                        children: [
                            this.create('div', {
                                class: 'd-flex',
                                children: [
                                    this.create('div', {
                                        css: {fontSize: 'var(--font-size-14)'},
                                        children: [
                                            this.create('span', {text: data.likes + ' likes'})
                                        ]
                                    }),
                                    this.create('div', {
                                        class: 'mx-3',
                                        children: [
                                            this.create('i', {
                                                class: 'fa ' + $that.Icons.reply
                                            }),
                                            this.create('span', {
                                                text: 'Reply',
                                                css: {fontSize: 'var(--font-size-14)'},
                                                class: 'text-black-50 mx-2 cursor-pointer',
                                                'data-reply-id': data.id,
                                                'data-parent-id': data.parentId
                                            })
                                        ]
                                    })
                                ]
                            }),
                            this.create('div', {
                                children: [
                                    this.create('i', {
                                        class: 'cursor-pointer me-1 fa ' + $that.Icons.like,
                                        'data-post-action': 'like', 'data-comment-id': data.id
                                    }),
                                ]
                            })
                        ]
                    });
                },
                comment (data={}) {
                    return this.create('div', {
                        id: 'comment-' + data.id,
                        class: 'd-flex w-100 my-2',
                        children: [
                            this.create('div', {
                                class: 'w-100 card border-0',
                                children: [
                                    this.create('div', {
                                        class: 'card-body',
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
                                            this.actionBar(data),
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

            let commentComponent = components.comment(data).css({
                    opacity: 0,
                    transition: 'opacity 0.5s ease-in-out',
                });

            this.target.find('#comments-' + this.id).prepend(commentComponent);
            setTimeout(() => this.target.find('#' + commentComponent.attr('id')).css({opacity: 1}), 100);

            this.onCreate(data)
                .then((res) => {})
                .catch((err) => {
                    this.notify(err.message, 'error');
                    this.target.find('#comment-' + data.id).remove();
                });
        }

        addEventListeners() {
            const $that = this;

            this.target.off('click').on('click', '[data-post-action]', function() {
                console.log('Like button clicked', $(this));
            });

            this.target.on('click', '[data-reply-id]', function() {
                const {replyId, parentId} = $(this).data();
                let $target = $that.target.find('#comment-' + replyId);
            });

            this.target.on('click', '[data-owner-action]', function() {
                const { ownerAction, id } = $(this).data();
                
                if (ownerAction == 'delete') {
                    confirm('Are you sure to delete this comment?') && $that.target.find('#comment-' + id).remove();
                }
            });

            this.target.on('click', '.create-comment', function() {
                const {id} = $(this).data();
                let content = $that.target.find('#textarea-' + id).val();

                if (!content || content.length < 3) return $that.notify('Please write a comment first', 'error');

                let data = {
                    id: $that.uuid(),
                    postId: $that.post.id,
                    content,
                    author: $that.user,
                    createdAt: new Date().toISOString(),
                    likes: 0,
                    replies: []
                };

                $that.createComment(data);
                $that.target.find('#textarea-' + id).val('');
            });
        }

        render(data=[]) {
            const $that = this;
            const components = this.components();

            return components.create('div', {
                children: [
                    components.commentInput(),
                    components.create('div', {
                        id: 'comments-' + $that.id,
                        class: 'mt-3',
                        children: data.map(c => components.create('div', {
                            id: 'comment-' + c.id,
                            children: [
                                components.comment(c),
                                ...((c.replies && c.replies.length > 0) ? (
                                    components.create('div', {
                                        class: 'w-100 d-flex justify-content-end',
                                        children: [
                                            components.create('div', {
                                                css: {width: '100%', borderLeft: '5px dashed #d1d1d1'},
                                                class: 'ps-3 ms-3',
                                                children: [
                                                    c.replies.map(e => components.comment(e))
                                                ]
                                            })
                                        ]
                                })
                                ) : '')
                            ]
                        }))
                    }),
                ],
                css: {
                    width: '100%'
                }
            });
        }
    }
    
    return CommentThread;
}));