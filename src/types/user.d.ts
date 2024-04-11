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

import { ObjectId } from "bson";
import { validUserFields } from "@src/user";
import { ValueOf } from ".";

export interface IUser {
    _id?: ObjectId
    _key?: string
    _scheme?: string
    userid?: number
    fullname?: string
    slug?: string
    username?: string
    email?: string
    emailConfirmed?: boolean
    password?: string
    passwordHash?: string
    birthday?: string
    picture?: string
    cover?: string
    location?: string
    bio?: string
    about?: string
    joiningDate?: string
    isOnline?: boolean
    lastOnline?: string
    gdprConsent?: boolean
    acceptedTnC?: boolean
    roles?: IRoles
    followers?: number
    posts?: number
    createdAt?: string
    updatedAt?: string
}

export interface IRoles {
    administrator?: string | number
    moderator?: string | number
    globalModerator?: string | number
}

export type ValidUserFields = "userid" | "fullname" | "slug" | "username" | "email" | "birthday" | "picture" | "cover" | "location" | "bio" | "about" | "roles" | "joiningDate" | "lastOnline";