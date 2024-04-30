/*
 * Copyright (C) 2024 Shawan Mandal <hello@imshawan.dev>.
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


/**
 * @date 30-04-2024
 * @author imshawan <hello@imshawan.dev>
 * 
 * @description This file will contain utility functions for type checking and manipulation.
 */

import _ from 'lodash';

const isBoolean = (value: any) => {
    if (_.isBoolean(value)) {
        return true;
    }
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value.toLowerCase() === 'false';
    }
}

const parseBoolean = (value: any) => {
    try {
        return JSON.parse(value);
    } catch (e) {
        return value;
    }
}

const object = {
    isEmpty: (value: object) => Object.keys(value).length === 0,
    isNotEmpty: (value: object) => Object.keys(value).length !== 0
}

export const types = {
    isBoolean, parseBoolean, object
}