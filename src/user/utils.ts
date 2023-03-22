import zxcvbn from 'zxcvbn';

const MINIMUM_PASS_LENGTH = 6;
const MAXIMUM_PASS_LENGTH = 256;
const MIN_STRENGTH = 2;

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

function checkPasswordStrength(password: string): object {
    let score=0, feedback={}, weak=false;
    const strength = zxcvbn(password);

    score = strength.score;
    feedback = strength.feedback;
    weak = score < MIN_STRENGTH;

    return {score, feedback, weak};
}


const utils = {
    validatePassword, checkPasswordStrength, isValidEmail
}

export {utils};