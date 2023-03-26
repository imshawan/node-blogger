import crypto from 'crypto';
import bcrypt from 'bcrypt';

interface IOptions {
    rounds?: number|string
    password?: string
    hash?: string
}

var randomHashCache: string;

const hash = async function (options: IOptions) {
    let {rounds=10, password=''} = options;
    if (!password) {
        throw new Error('password is required and cannot be null');
    }

	password = crypto.createHash('sha512').update(password).digest('hex');

    return await hashPassword({rounds, password});
};

const compare = async function (options: IOptions) {
    let {hash='', password=''} = options;
    if (!password) {
        throw new Error('password is required and cannot be null');
    }
    if (!hash) {
        hash = await generateRandomHash();
    }

    password = crypto.createHash('sha512').update(password).digest('hex');

    return await compareHashWithPassword({password, hash});
};

async function generateRandomHash() {
	if (randomHashCache) {
		return randomHashCache;
	}
	randomHashCache = await hash({
        rounds: 12,
        password: Math.random().toString()
    });

	return randomHashCache;
}

async function hashPassword(options: IOptions) {
    let {rounds=10, password=''} = options;

    rounds = typeof rounds === 'string' ? parseInt(rounds, 10) : rounds;

	const salt = await bcrypt.genSalt(rounds);
	return await bcrypt.hash(password, salt);
}

async function compareHashWithPassword(options: IOptions) {
    const {hash='', password=''} = options;

	return await bcrypt.compare(String(password || ''), String(hash || ''));
}

const password = {hash, compare};

export {password};