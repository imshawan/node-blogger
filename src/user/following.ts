import { database } from '@src/database';
import { getUserByUserId } from './data';

async function follow(userid: number, caller: number) {
    if (isNaN(userid) || isNaN(caller)) {
        throw new Error('userid and caller must be both numbers.')
    }

    userid = Number(userid);
    caller = Number(caller);

    if (userid === caller) {
        throw new Error('Cannot follow own-self');
    }

    const [userExists, callerExists] = await Promise.all([
        getUserByUserId(userid),
        getUserByUserId(caller)
    ]);

    if (!userExists) {
        throw new Error('User does not exists');
    }
    if (!callerExists) {
        throw new Error('Caller does not exists');
    }

    if (await isFollowing(userid, caller)) {
        return;
    }

}

async function isFollowing(userid: number, caller: number) {
    if (isNaN(userid) || isNaN(caller)) {
        throw new Error('userid and caller must be both numbers.')
    }

    return false
}