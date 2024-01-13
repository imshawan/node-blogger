import { ICategory, ICategoryTag } from "../types";

/**
 * Namespace containing various interfaces for managing categories.
 * @namespace Category
 */
declare namespace Category {

    /**
     * Creating a new category.
     * @interface Create
     */
    interface Create {
        create(data: ICategory): Promise<ICategory>
    }

    /**
     * Retrieving data related to categories.
     * @interface Data
     */
    interface Data {
         /**
         * Retrieves categories with associated data.
         */
        getCategoriesWithData(perPage?: number, page?: number, fields?: string[], sorting?: string): Promise<any>

        /**
         * Retrieves all categories.
         */
        getAllCategories(perPage?: number, page?: number, fields?: string[], sorting?: string | null, subCategories?: boolean): Promise<Array<ICategory>>
        
         /**
         * Retrieves a category by its ID.
         */
        getCategoryByCid(id: any, fields?: string[]): Promise<ICategory>

        /**
         * Retrieves categories by name.
         */
        getCategoryByName(name: string, perPage?: number, page?: number, fields?: string[], sorting?: string | null, subCategories?: boolean): Promise<Array<ICategory>>

        /**
         * Retrieves a category by its slug.
         */
        getCategoryBySlug(slug: string): Promise<ICategory>
    }

    /**
     * Removing categories.
     * @interface Remove
     */
    interface Remove {
        /**
         * Deletes a category by its ID.
         */
        deleteCategory(id: any, callerId: number): Promise<void>
    }

    /**
     * Managing category tags.
     * @interface Tags
     */
    interface Tags {
        /**
         * Creates a new category tag.
         */
        create(tagData: ICategoryTag): Promise<any>

        /**
         * Retrieves a category tag by its ID and category ID.
         */
        getById(tagId: number, cid: number, fields?: Array<string>): Promise<ICategoryTag>

        /**
         * Retrieves category tags by category ID.
         */
        getByCategoryId(cid: number, fields?: Array<string>): Promise<ICategoryTag>

        /**
         * Removes a category tag.
         */
        remove(tagData: ICategoryTag, callerId: number): Promise<void>
    }

    /**
     * Updating category information.
     * @interface Update
     */
    interface Update {
        /**
         * Updates category information.
         */
        update(data: ICategory): Promise<ICategory>
    }

     /**
     * Utility functions related to categories.
     * @interface Utils
     */
    interface Utils {
        /**
         * Generates a category slug based on the category name.
         */
        generateCategoryslug(name: string): Promise<string>

        /**
         * Generates the next available category ID.
         */
        generateNextCategoryId(): Promise<number>

        /**
         * Generates the next available category tag ID.
         */
        generateNextTagId(): Promise<number>
    }
}

export = Category;