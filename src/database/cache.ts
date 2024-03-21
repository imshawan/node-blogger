/**
 * @date 25-02-2024
 * @author imshawan <hello@imshawan.dev>
 * 
 * @class Cache
 * @description This class provides an interface for managing a cache with LRU (Least Recently Used) eviction policy.
 * It utilizes the 'lru-cache' library for caching functionality.
 */

import { ValueError } from '@src/helpers';
import { CacheOptions, MutableObject } from '@src/types';
import { LRUCache } from 'lru-cache';

export class Cache {
    private readonly cache:  LRUCache<any, string, unknown>;
    private readonly enabled: boolean | undefined;
    private readonly max: number;
    private readonly name: string;
    private readonly noDisposeOnSet?: boolean;
    private readonly updateAgeOnGet?: boolean;
    private readonly sizeCalculation: ((key: string, value: any) => number) | undefined;
    private readonly dispose?: (key: string, value: any) => void;
    private allowStale?: boolean;
    private maxAge: number | undefined;
    private hits: number;
    private misses: number;
    
    constructor(params: CacheOptions) {
        this.name = params.name ?? '';
        this.max = params.max ?? 4000;
        this.maxAge = params.maxAge ?? 0;
        this.noDisposeOnSet = params.noDisposeOnSet ?? false;
        this.updateAgeOnGet = params.updateAgeOnGet ?? false;
        this.allowStale = params.allowStale ?? false;
        this.dispose = params.dispose;
        this.sizeCalculation = params.sizeCalculation;
        this.enabled = params.hasOwnProperty('enabled') ? params.enabled : true;

        this.hits = 0;
        this.misses = 0;
        this.cache = this.initialize();
    }

    private initialize(): LRUCache<any, string, unknown> {
        const cacheOptions: CacheOptions = {
            max: this.max,
            maxAge: this.maxAge,
            allowStale: this.allowStale,
            noDisposeOnSet: this.noDisposeOnSet,
            updateAgeOnGet: this.updateAgeOnGet,
        };

        if (!this.name.length) {
            throw new ValueError('A valid cache name is required for initialization.');
        }

        function isFunction(prop: any): boolean {
            return prop && typeof prop === 'function';
        }

        if (isFunction(this.dispose)) {
            cacheOptions.dispose = this.dispose;
        }
        if (isFunction(this.sizeCalculation)) {
            cacheOptions.sizeCalculation = this.sizeCalculation;
        }

        return new LRUCache(cacheOptions);
    }

    set(key: string, value: any) {
        if (this.enabled) {
            this.cache.set(key, value);
        }
    }

    get(key: string): string | undefined {
        if (!this.enabled) {
            return
        }

        let value = this.cache.get(key);
        if (value === undefined) {
            this.misses++;
        } else {
            this.hits++;
        }

        return value;
    }

    getBulk(keys: string[]) {
        if (!this.enabled) {
            return undefined;
        }
        if (!Array.isArray(keys) || !keys.length) {
            return undefined;
        }

        const hits: string[] = [], misses: string[] = [], data: Array<any> = [];

        keys.forEach(key => {
            let value = this.cache.get(key);
            if (value === undefined) {
                misses.push(key);
                this.misses++;
            } else {
                hits.push(key);
                data.push(value);
                this.hits++;
            }
        });

        return {hits, misses, data}
    }

    delete(key: string) {
        this.deleteBulk([key]);
    }

    deleteBulk(keys: string[]) {
        if (!Array.isArray(keys)) {
            return;
        }

        keys.forEach(key => this.cache.delete(key));
    }

    clear() {
        this.hits = 0;
        this.misses = 0;
        this.cache.clear();
    }

    getMissCount() {
        return this.misses;
    }

    getHitsCount() {
        return this.hits;
    }
}