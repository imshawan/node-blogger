/**
 * @date 10-05-2024
 * @author imshawan <hello@imshawan.dev>
 * 
 * @description Enum representing different types of locks for actions on a blogging platform.
 */
export enum Locks {
    /**
     * Lock for creating a new post.
     */
    CREATE_POST = "create_post",

    /**
     * Lock for editing an existing post.
     */
    EDIT_POST = "edit_post",

    /**
     * Lock for deleting a post.
     */
    DELETE_POST = "delete_post",

    /**
     * Lock for commenting on a post.
     */
    COMMENT_POST = "comment_post",

    /**
     * Lock for liking a post.
     */
    LIKE_POST = "like_post",

    /**
     * Lock for following another user.
     */
    FOLLOW_USER = "follow_user",

    /**
     * Lock for unfollowing a user.
     */
    UNFOLLOW_USER = "unfollow_user",

    /**
     * Lock for flagging inappropriate content.
     */
    FLAG_CONTENT = "flag_content",

    /**
     * Lock for reporting a user.
     */
    REPORT_USER = "report_user",

    /**
     * Lock for creating a new category.
     */
    CREATE_CATEGORY = "create_category",

    /**
     * Lock for deleting a category.
     */
    DELETE_CATEGORY = "delete_category",

    /**
     * Lock for updating a category.
     */
    UPDATE_CATEGORY = "update_category",
}
