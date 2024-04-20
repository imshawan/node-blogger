import zxcvbn from 'zxcvbn';
import { getUserByUsername } from './data';
import { database } from '@src/database';
import { slugify, sanitizeString, password as Password } from '@src/utilities';
import { application } from '@src/application';
import { IUser, IUserMetrics, MutableObject } from '@src/types';
import _ from 'lodash';

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

async function getUserMetrics (userids: number[]): Promise<IUserMetrics[]> {
    if (!userids || !userids.length) return [];
    if (!Array.isArray(userids)) {
        userids = [userids];
    }

    userids = _.uniq(userids);

    const userSets = userids.map(userid => 'user:' + userid + ':metrics');
    const usersMetrices: IUserMetrics[] = await database.getObjectsBulk(userSets);

    return usersMetrices.filter(metric => metric);
}

function createMetricsMap(metrics: IUserMetrics[]): Map<number, IUserMetrics> {
    const metricsMap: Map<number, IUserMetrics> = new Map();

    metrics.forEach(metric => {
        if (metric._key) {
            metricsMap.set(Number(metric._key.slice(5, -7)), metric);
        }
    });

    return metricsMap;
}

function serializeMetrics (userMetrics: IUserMetrics): IUserMetrics {

    const fields = ['followers', 'posts', 'following'] as (keyof IUserMetrics)[];
    const serializedObj: MutableObject = Object.assign({}, userMetrics);

    fields.forEach(field => {
        if (!userMetrics[field] || userMetrics[field] == -1) {
            serializedObj[field] = 0;
        }
    });

    return serializedObj;
}

async function isValidUserPassword(userid: number, currentPassword: string): Promise<boolean> {
    if (!userid || !currentPassword) {
        throw new Error('userid and currentPassword are required parameters');
    }
    if (typeof userid !== 'number') {
        throw new Error(`userid must be a number found ${typeof userid} instead`);
    }
    if (typeof currentPassword !== 'string') {
        throw new Error(`currentPassword must be a string found ${typeof currentPassword} instead`);
    }

    const user = await database.getObjects('user:' + userid, ['passwordHash']);
    if (!user) {
        throw new Error('User not found');
    }
    const passwordHash = user.passwordHash;
    return await Password.compare({
        password: currentPassword,
        hash: passwordHash,
    });
}

const utils = {
    validatePassword, checkPasswordStrength, isValidEmail, validateUsername, checkEmailAvailability,
    generateNextUserId, generateUserslug, hasCompletedConsent, getUserMetrics, createMetricsMap, serializeMetrics, isValidUserPassword,
}

export {utils};