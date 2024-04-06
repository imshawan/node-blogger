/*
 * Copyright (C) 2023 Shawan Mandal <hello@imshawan.dev>.
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

import { Express } from 'express';
import { ValidSortingTechniques } from "@src/constants";

export * from './database';
export * from './authentication';
export * from './application';
export * from './category';
export * from './user';
export * from './test';
export * from './webmanifest';
export * from './email';
export * from './sidebar';
export * from './post';

export interface MutableObject { [x: string]: any; }

export type ValueOf<T> = T[keyof T];

export type TimeUnitSuffix = 'ms' | 'msec' | 'milli' | 'millisecond' | 'sec' | 'second' | 'min' | 'minute' | 'hr' | 'hour';

export type ValidSortingTechniquesTypes = keyof typeof ValidSortingTechniques;

export interface MulterFilesArray extends Express.Multer.File {
    url: string
}

export interface ExpressUser extends Express.User {
    userid: number
    email: string
}

export interface IPagination {
    data: any[];
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
    navigation: {
        current: string;
        next: string | null;
        previous: string | null;
    };
    start: number;
    end: number;
}

export interface IPaginationItem {
    navigation: {
        previous: Items;
        next: Items
    }
    items: Items[]
}

interface Items {
    pageNumber?: number | string;
    isCurrent?: boolean;
    url?: string
}