/**
 * Options for configuring the LRUCache.
 */
export interface CacheOptions {
    /** Return stale items before removing from cache? */
    allowStale?: boolean;

    /** Name of the cache */
    name?: string;

    /** Maximum size of the cache */
    max: number;

    /** Default expiration time for cache entries */
    maxAge?: number;

    /** Whether the cache is enabled or not */
    enabled?: boolean;

    /** 
     * Function called when an item is dropped from the cache.
     * @param key - The key of the item being dropped.
     * @param value - The value of the item being dropped.
     */
    dispose?: (key: string, value: any) => void;

    /** 
     * Prevents calling the dispose function when an item is overwritten or re-added.
     */
    noDisposeOnSet?: boolean;

    /** 
     * Time in milliseconds after which an item is considered stale but not immediately removed.
     */
    stale?: number;

    /** 
     * Whether to update the "age" of an item on every get operation.
     */
    updateAgeOnGet?: boolean;

    /**
     * Calculate the size of stored items in the LRUCache.
     * @param value 
     * @param key 
     * @returns Size of the cache
     */
    sizeCalculation?: (key: string, value: any) => number;

    /** 
     * Function called before returning an item from cache on get.
     * @param key - The key of the item.
     * @param value - The value of the item.
     * @returns True if the item is valid, false otherwise.
     */
    validate?: (key: string, value: any) => boolean;

    /** 
     * Whether to initialize the cache immediately with one item.
     */
    noInit?: boolean;
}