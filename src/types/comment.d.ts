import { IUser } from "./user";

/**
 * @description Interface representing a comment on a post.
 */
export interface IComment {
    /** Unique key associated with comments */
    _key?: string

    /** The unique ID of the comment. */
    id?: string;

    /** The ID of the post to which the comment belongs. */
    postId?: number;

    /** User id of the author */
    userid?: number;

    /** The author of the comment. */
    author?: IUser;

    /** The content of the comment. */
    content?: string;

    /** The date and time when the comment was created (ISO string format). */
    createdAt?: string;

    /** The date and time when the comment was last updated (ISO string format). */
    updatedAt?: string;

    /** The number of likes the comment has received. */
    likes?: number;

    /** Indicates whether the comment is a reply to another comment. */
    parent?: number;

    /** The list of replies to the comment. */
    replies?: Comment[];

     /** The number of replies to the comment. */
    replyCount?: number;

    /** The status of the comment (e.g., "published", "deleted", "pending"). */
    status?: 'published' | 'deleted' | 'pending';

    /** A flag indicating whether the comment has been edited. */
    edited?: boolean;

    /** A flag indicating whether the comment has been reported. */
    reported?: boolean;

    /** The number of times the comment has been reported. */
    reportCount?: number;
  }