import zxcvbn from 'zxcvbn';
import { getUserByUsername } from './data';
import { database } from '@src/database';
import { slugify, sanitizeString } from '@src/utilities';
import { application } from '@src/application';
import { IUser } from '@src/types';

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
    const MINIMUM_PASS_LENGTH = application.configurationStore?.minPasswordLength || 6;
    const MAXIMUM_PASS_LENGTH = application.configurationStore?.maxPasswordLength || 256;
    const MIN_STRENGTH = application.configurationStore?.minPasswordStrength || 2;
    
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
    const MIN_STRENGTH = application.configurationStore?.minPasswordStrength || 2;
    const strength = zxcvbn(password);
    let score=0, weak=false;

    score = strength.score;
    weak = score < MIN_STRENGTH;
    const {warning, suggestions} = strength.feedback;

    return {score, warning, suggestions, weak};
}

async function validateUsername(username: string) {
    const MINIMUM_USERNAME_LENGTH = application.configurationStore?.minUsernameLength || 3;
    const MAXIMUM_USERNAME_LENGTH = application.configurationStore?.maxUsernameLength || 100;

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
    const found = await database.getObjects('user:email:' + email);
    if (found && Object.keys(found)) {
        throw new Error('An account with the email already exists');
    }
}

async function generateUserslug(username: string): Promise<string> {
    let slug = slugify(username);

    const userFound = await database.getObjects('user:username:' + sanitizeString(slug), [], {multi: true});

    if (userFound && userFound.length) {
        return String(slug + '-' + (userFound.length + 1));
    }

    return slug;
}

async function generateNextUserId() {
    return await database.incrementFieldCount('user');
}

async function hasCompletedConsent(userid: Number) {
    if (!userid) {
        throw new Error('A userid is required to check against');
    }
    if (typeof userid != 'number') {
        throw new Error(`userid must be a number found ${typeof userid} instead`);
    }

    const consent = await database.getObjects('user:' + userid + ':registeration');
    return consent;
}

function serialize (userData: IUser) {
    if (!userData.followers || userData.followers == -1) {
        userData.followers = 0;
    }

    return userData;
}

const utils = {
    validatePassword, checkPasswordStrength, isValidEmail, validateUsername, checkEmailAvailability,
    generateNextUserId, generateUserslug, hasCompletedConsent, serialize
}

export {utils};