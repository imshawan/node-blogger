import { database } from '@src/database';
import { getUserByUserId } from './data';
import { IUser } from '@src/types';

const validActions = ['follow', 'unfollow'];

const follow = async function (userid: number, caller: number): Promise<IUser> {
    return await handleFollowing(userid, caller, 'follow');

}

const unFollow = async function (userid: number, caller: number): Promise<IUser> {
    return await handleFollowing(userid, caller, 'unfollow');

}

const isFollowing = async function (userid: number, caller: number) {
    if (isNaN(userid) || isNaN(caller)) {
        throw new Error('userid and caller must be both numbers.');
    }
    if (userid < 1 || caller < 1) {
        return false;
    }

    const userKey = 'user:' + userid;
    const follow = await database.getSortedSetValue(userKey + ':follower', 'user:' + caller);

    return Boolean(follow);
}

async function handleFollowing(userid: number, caller: number, action: 'follow' | 'unfollow'): Promise<IUser> {
    if (isNaN(userid) || isNaN(caller)) {
        throw new Error('userid and caller must be both numbers.');
    }
    if (!validActions.includes(action)) {
        throw new Error('Invalid action ' + action);
    }

    userid = Number(userid);
    caller = Number(caller);

    if (userid === caller) {
        throw new Error('Cannot ' + action + ' own-self');
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

    const alreadyFollowing = await isFollowing(userid, caller),
        userKey = 'user:' + userid,
        callerKey = 'user:' + caller,
        now = Date.now();

    if (action === 'follow' && alreadyFollowing) {
        return userExists;
    }
    if (action === 'unfollow' && !alreadyFollowing) {
        return userExists;
    }

    if (action === 'follow') {
        await Promise.all([
            database.sortedSetAddKeys([
                [userKey + ':follower', callerKey, now],
                [callerKey + ':following', userKey, now]
            ]),
            database.incrementFieldCount('followers', userKey + ':metrics'),
            database.incrementFieldCount('following', callerKey + ':metrics'),
        ]);
    } else if (action === 'unfollow') {
        await Promise.all([
            database.sortedSetRemoveKeys([
                [userKey + ':follower', callerKey],
                [callerKey + ':following', userKey]
            ]),
            database.decrementFieldCount('followers', userKey + ':metrics'),
            database.decrementFieldCount('following', callerKey + ':metrics'),
        ]);
    }

    return userExists;
}

export const followers = {
    follow, unFollow, isFollowing
}