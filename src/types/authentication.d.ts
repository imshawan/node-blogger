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

export interface IUserRegisteration {
    username: string,
    email: string,
    password: string,
    confirmpassword: string
}

export interface IGoogleProviderConfig {
    clientId: string;
    clientSecret: string;
    authUrl: string;
    redirectUrl: string;
}

/**
 * @interface IGoogleUser
 * @description IGoogleUser interface to match the structure of the Google user object
 */
export interface IGoogleUser {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
}