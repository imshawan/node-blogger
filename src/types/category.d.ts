/*
 * Copyright (C) 2023 Shawan Mandal <github@imshawan.dev>.
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

export interface ICategory {
    _key?: string
    _scheme?: string
    cid?: number
    parent?: number | ICategory
    userid?: number
    name?: string
    description?: string
    blurb?: string
    slug?: string
    thumb?: string | null | undefined
    altThumb?: string | null | undefined
    tags?: number
    posts?: number
    tagsPerPost?: TagsPerPost
    isActive?: boolean
    deleted?: boolean
    createdAt?: string
    updatedAt?: string
}

export interface ICategoryTag {
    _key?: string
    _scheme?: string
    cid?: number
    tagId?: number
    userid?: number
    name?: string
    slug?: string
    posts?: number
    deleted?: boolean
    deletedAt?: string
    createdAt?: string
    updatedAt?: string
}

interface Counters {
    posts?: number
    tags?: number
}

interface TagsPerPost {
    min: number
    max: number
}