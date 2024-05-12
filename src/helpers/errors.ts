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

import HttpStatusCodes from '@src/constants/HttpStatusCodes';

/**
 * @date 04-10-2023
 * @author imshawan
 * @description This file defines a collection of custom error classes that can be used to handle 
 * and identify specific error scenarios in your TypeScript application.
 * 
 * Each error class extends the built-in Error class and provides a distinct name
 * for easy identification and handling.
 */


/**
 * 
 * @class ValueError
 * @description ValueError will be typically used to represent errors related to invalid or unexpected values.
 */
export class ValueError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValueError';
    }
}

/**
 * 
 * @class NotFoundError
 * @description NotFoundError will be used to represent errors when a requested resource or entity is not found.
 */
export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

/**
 * 
 * @class ValidationError
 * @description ValidationError class represents errors related to input validation.
 * This can be thrown when user input doesn't meet validation criteria.
 */
export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

/**
 * @class PermissionError
 * @description PermissionError class represents errors related to insufficient permissions.
 * This can be thrown when a user tries to access a resource or perform an action they don't have permission for.
 */
export class PermissionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PermissionError';
    }
}

/**
 * @class DatabaseError
 * @description DatabaseError class represents errors related to database operations.
 *              This can be thrown when a database query fails, connections are lost, or transactions encounter issues.
 */
export class DatabaseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DatabaseError';
    }
}

/**
 * @class FileNotFoundError
 * @description FileNotFoundError class represents errors when a file or directory is not found.
 * This can be thrown when trying to access a file that doesn't exist or opening a directory that's missing.
 */
export class FileNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FileNotFoundError';
    }
}

/**
 * @class AuthenticationError
 * @description AuthenticationError class represents errors related to user authentication.
 * This can be thrown when login credentials are invalid or when authentication tokens expire.
 */
export class AuthenticationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'AuthenticationError';
    }
}

/**
 * @class ConfigurationError
 * @description ConfigurationError class represents errors related to application configuration.
 * This can be thrown when required configuration values are missing or invalid.
 */
export class ConfigurationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ConfigurationError';
    }
}

/**
 * @class DuplicateEntryError
 * @description DuplicateEntryError class represents errors when attempting to create duplicate entries.
 * This can be thrown when inserting data that violates uniqueness constraints.
 */
export class DuplicateEntryError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'DuplicateEntryError';
    }
}

/**
 * Error with status code and message
 */
export class RouteError extends Error {
    status: HttpStatusCodes;
    constructor(status: HttpStatusCodes, message: string) {
      super(message);
      this.status = status;
    }
  }