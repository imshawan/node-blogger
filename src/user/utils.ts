import zxcvbn from 'zxcvbn';
import { getUserByUsername } from './data';
import { database } from '@src/database';

const MINIMUM_PASS_LENGTH = 6;
const MINIMUM_USERNAME_LENGTH = 3;
const MAXIMUM_PASS_LENGTH = 256;
const MAXIMUM_USERNAME_LENGTH = 100;
const MIN_STRENGTH = 2;

interface IPasswordStrength {
    warning: string
    suggestions: Array<string>
    score: number
    weak: boolean
}

function isValidEmail (email: string): boolean {
    const isValid = String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );

    return Boolean(isValid && isValid.length);
};

function validatePassword(password: string): void {
    if (password.length < MINIMUM_PASS_LENGTH) {
        throw new Error('Password too short');
    }

    if (password.length > MAXIMUM_PASS_LENGTH) {
        throw new Error('Password too long');
    }

    const strength = zxcvbn(password);
    if (strength.score < MIN_STRENGTH) {
        throw new Error('Weak password');
    }
}

function checkPasswordStrength(password: string): IPasswordStrength {
    let score=0, weak=false;
    const strength = zxcvbn(password);

    score = strength.score;
    weak = score < MIN_STRENGTH;
    const {warning, suggestions} = strength.feedback;

    return {score, warning, suggestions, weak};
}

async function validateUsername(username: string) {
    username = username.trim();
    if (username.length < MINIMUM_USERNAME_LENGTH) {
        throw new Error('Username too short');
    }

    if (username.length > MAXIMUM_USERNAME_LENGTH) {
        throw new Error('Username too long');
    }

    const user = await getUserByUsername(username);
    if (user) {
        throw new Error('Username already taken')
    }
}

async function checkEmailAvailability(email: string): Promise<void> {
    // TODO
    // Need to implement the functionality
}

async function generateNextUserId() {
    return await database.incrementFieldCount('user');
}

const utils = {
    validatePassword, checkPasswordStrength, isValidEmail, validateUsername, checkEmailAvailability,
    generateNextUserId
}

export {utils};