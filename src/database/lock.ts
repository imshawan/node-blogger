/**
 * @date 10=05-2024
 * @author imshawan <hello@imshawan.dev>
 * 
 * @file Provides functions for locking and unlocking actions on the blogging platform.
 * @description This file contains functions to lock, unlock, and check if an action is locked using MongoDB.
 */

import { Collections, Locks } from "@src/constants";
import { mongo } from "./init";
import { ILockData } from "@src/types";
import { Db, ObjectId } from "mongodb";

/**
 * Locks an action for a specific caller for a certain duration.
 * @param {number} caller - The ID of the user initiating the action.
 * @param {keyof typeof Locks} type - The type of action being locked.
 * @returns {Promise<void>} - A Promise that resolves once the action is locked.
 */
const lock = async function (caller: number, type: keyof typeof Locks): Promise<void> {
    validate(caller, type);

    const key = 'lock:' + caller + ':' + type,
        now = new Date(),
        expires = now.getTime() + 300,
        mongoOptions = {upsert: true, returnDocument: 'after', returnOriginal: false},
        data = {
            _key: key,
            type: type,
            caller: Number(caller),
            lockedAt: now,
            expiresAt: expires
        };

    await mongo.client.collection(Collections.LOCKS).findOneAndUpdate({_id: new ObjectId()}, {$set: data}, mongoOptions);
}

/**
 * Unlocks an action for a specific caller.
 * @param {number} caller - The ID of the user initiating the action.
 * @param {keyof typeof Locks} type - The type of action being unlocked.
 * @returns {Promise<void>} - A Promise that resolves once the action is unlocked.
 */
const unlock = async function (caller: number, type: keyof typeof Locks): Promise<void> {
    validate(caller, type);

    const key = 'lock:' + caller + ':' + type;

    await (mongo.client as Db).collection(Collections.LOCKS).deleteMany({_key: key});
}

/**
 * Checks if an action is currently locked for a specific caller.
 * @param {number} caller - The ID of the user initiating the action.
 * @param {keyof typeof Locks} type - The type of action being checked.
 * @returns {Promise<boolean>} - A Promise that resolves with a boolean indicating whether the action is locked.
 */
const isLocked = async function (caller: number, type: keyof typeof Locks): Promise<boolean> {
    validate(caller, type);

    const key = 'lock:' + caller + ':' + type;
    const lock = await (mongo.client as Db).collection(Collections.LOCKS).findOne({_key: key}) as ILockData | null;

    return lock ? lock.expiresAt > new Date().getTime() : false;
}

/**
 * Validates the caller and type parameters.
 * @param {number} caller - The ID of the user initiating the action.
 * @param {keyof typeof Locks} type - The type of action being checked.
 * @returns {void}
 * @throws {Error} Throws an error if caller or type is invalid.
 */
function validate(caller: number, type: keyof typeof Locks): void {
    if (!caller || !type) {
        throw new Error('type and caller are required paremeters');
    }
    if (typeof type !== 'string') {
        throw new Error('type must be a string, found ' + typeof type);
    }
    if (!isValidLockType(type)) {
        throw new Error('Invalid lock type ' + type);
    }
}

/**
 * Checks if a lock type is valid.
 * @param {string} lockType - The lock type to validate.
 * @returns {boolean} - Returns true if the lock type is valid, otherwise false.
 */
function isValidLockType(lockType: string): boolean {
    return Object.prototype.hasOwnProperty.call(Locks, lockType);
}

export default {
    lock, unlock, isLocked
} as const;