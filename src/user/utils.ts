import zxcvbn from 'zxcvbn';
import { getUserByUsername } from './data';
import { database } from '@src/database';
import { slugify } from '@src/utilities';
import { meta } from '@src/meta';

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
    const MINIMUM_PASS_LENGTH = meta.configurationStore?.minPasswordLength || 6;
    const MAXIMUM_PASS_LENGTH = meta.configurationStore?.maxPasswordLength || 256;
    const MIN_STRENGTH = meta.configurationStore?.minPasswordStrength || 2;
    
    if (!password || !password.length) {
        throw new Error('Password is required');
    }

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
    const MIN_STRENGTH = meta.configurationStore?.minPasswordStrength || 2;
    const strength = zxcvbn(password);
    let score=0, weak=false;

    score = strength.score;
    weak = score < MIN_STRENGTH;
    const {warning, suggestions} = strength.feedback;

    return {score, warning, suggestions, weak};
}

async function validateUsername(username: string) {
    const MINIMUM_USERNAME_LENGTH = meta.configurationStore?.minUsernameLength || 3;
    const MAXIMUM_USERNAME_LENGTH = meta.configurationStore?.maxUsernameLength || 100;

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
    const found = await database.getObjects({email, _key: 'user'});
    if (found && Object.keys(found)) {
        throw new Error('An account with the email already exists');
    }
}

async function generateUserslug(username: string): Promise<string> {
    let index = 0;

    return slugify(username);
    // while (true) {
    //     let slug = slugify(username);
    //     slug = index < 0 ? String(slug + '-' + index) : slug;

    //     const found = await database.getObjects({slug, _key: 'user'});
    //     if (found) {
    //         index++;
    //     } else {
    //         return slug;
    //     }
    // }
}

async function generateNextUserId() {
    return await database.incrementFieldCount('user');
}

const utils = {
    validatePassword, checkPasswordStrength, isValidEmail, validateUsername, checkEmailAvailability,
    generateNextUserId, generateUserslug,
}

export {utils};