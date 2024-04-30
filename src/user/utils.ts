import zxcvbn from 'zxcvbn';
import { getUserByUsername } from './data';
import { database } from '@src/database';
import { slugify, sanitizeString, password as Password, generateTOTP } from '@src/utilities';
import { application } from '@src/application';
import { IUser, IUserAgent, IUserMetrics, MutableObject } from '@src/types';
import { Request } from 'express';
import _ from 'lodash';
import Jwt from 'jsonwebtoken';
import Handlebars from 'handlebars';
import nconf from 'nconf';
import Mail from 'nodemailer/lib/mailer';
import { emailer } from '@src/email/emailer';
import {template as Template} from "@src/email";

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

    let filtered = usersMetrices.filter(metric => metric);

    return filtered.map((metric: IUserMetrics) => {
        if (metric._key) {
            let userKey = Number(metric._key.slice(5, -8));
            return {...metric, userid: userKey, _key: undefined};
        }
        return metric;
    });
}

function createMetricsMap(metrics: IUserMetrics[]): Map<number, IUserMetrics> {
    const metricsMap: Map<number, IUserMetrics> = new Map();

    metrics.forEach(metric => {
        metricsMap.set(Number(metric.userid), metric);
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

async function isValidUserPassword(user: IUser, currentPassword: string): Promise<boolean> {
    if (!user || !currentPassword) {
        throw new Error('user and currentPassword are required parameters');
    }
    if (typeof user !== 'object') {
        throw new Error(`user must be a object found ${typeof user} instead`);
    }
    if (typeof currentPassword !== 'string') {
        throw new Error(`currentPassword must be a string found ${typeof currentPassword} instead`);
    }

    const passwordHash = (user.passwordHash ?? '');
    
    return await Password.compare({
        password: currentPassword,
        hash: passwordHash,
    });
}

/**
 * 
 * @date 28-04-2023
 * @author imshawan <hello@imshawan.dev>
 * 
 * @function sendPasswordResetEmail
 * @param req Incoming request
 * @param userData User data
 * @param expiresIn expressed in seconds or a string describing a time span.  Eg: 60.
 */

async function sendPasswordResetEmail(req: Request, userData: IUser, expiresIn: number = 3600) {
    if (!userData || !Object.keys(userData).length) {
        throw new Error('userData is a required parameter and cannot be empty');
    }

    if (!expiresIn || typeof expiresIn !== 'number') {
        throw new Error('expiresIn is a required parameter and must be a number, found ' + typeof expiresIn);
    }

    const {userid, email, username, fullname} = userData;

    if (!await canGenerateResetToken(Number(userid))) {
        throw new Error('You have reached the maximum number of password reset attempts per day');
    }

    const payload = { email, userid };
    const secretKey = generateTOTP(8);
    const sender = application.configurationStore?.applicationEmail,
        senderName = application.configurationStore?.applicationEmailFromName;

    const token = Jwt.sign(payload, secretKey, { expiresIn });
    const now = Math.round(Date.now() / 1000);
    const useragent = req.useragent || {} as IUserAgent;
    const templateSource = await Template.getBySlug('password_reset', ['html']);

    const templateDataBinder = Handlebars.compile(templateSource?.html ?? '')

    let resetUrl = `${nconf.get('host')}/password/reset/${token}`;
    let html = templateDataBinder({
        name: fullname || username,
        productName: application.configurationStore?.siteName,
        os: useragent.os,
        browser: useragent.browser,
        resetUrl,
        expiresIn: Math.floor(expiresIn / 3600),
        companyAddr: '',
        supportUrl: '#',
    });

    let emailMessage: Mail.Options = {
        from: sender,
        to: email,
        subject: 'Password reset',
        html: html,
    };

    await emailer.sendMail(emailMessage);

    let tokenKey = `${token}:${secretKey}`,
        userKey = 'user:' + userid + ':reset';
    
    await database.sortedSetAddKey(userKey, tokenKey, now);
}

async function canGenerateResetToken(userid: number) {
    // Max attempts per 3 hours
    const maxAttempts = application.configurationStore?.maxPasswordResetAttempts ?? 15;
    const resetRequests = await database.fetchSortedSetsRangeReverseWithRanks('user:' + userid + ':reset', 0, maxAttempts);
    
    const now = new Date();
    const end = Math.round(now.getTime() / 1000);
    const start = Math.round(end - (3 * 60 * 60 * 1000)); // 3 hours (in milliseconds)
    
    let attempts = 0;
    
    resetRequests.forEach((request: {value: any, rank: number}) => {
        let rank = Number(request.rank);
        if (rank >= start && rank <= end) {
            attempts++;
        }
    });

    return attempts < maxAttempts;
}

function decodeToken (token: string): {userid: number; email: string;} | null {
    if (!token) {
        throw new Error('token is a required parameter and cannot be empty');
    }

    if (typeof token !== 'string') {
        throw new Error(`token must be a string found ${typeof token} instead`);
    }

    try {
        return Jwt.decode(token) as {userid: number; email: string;};
    } catch (error) {
        return null;
    }
}

function validatePasswordResetToken(token: string, secretKey: string) {
    if (!token || !secretKey) {
        throw new Error('token and secretKey are required parameters');
    }
    if (typeof token !== 'string') {
        throw new Error(`token must be a string found ${typeof token} instead`);
    }
    
    try {
        const decoded = Jwt.verify(token, secretKey);
        return decoded;
    } catch (error) {
        return null;
    }
}

const utils = {
    validatePassword, checkPasswordStrength, isValidEmail, validateUsername, checkEmailAvailability,
    generateNextUserId, generateUserslug, hasCompletedConsent, getUserMetrics, createMetricsMap, serializeMetrics, isValidUserPassword,
    sendPasswordResetEmail, validatePasswordResetToken, decodeToken
}

export {utils};