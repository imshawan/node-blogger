import { database } from "@src/database";

const serializeUser = async function serializeUser(user: any, done: Function) {
    done(null, user._id);
}

const deserializeUser = async function deserializeUser(id: any, done: Function) {
    try {
        const user = await database.getObjects({_id: id});
        if (user) {
            done(null, user)
        } else done(new Error('Count not find user'), {})
    } catch (err) {
        done(err, {});
    }
}

const authentication = {
    serializeUser, deserializeUser
}

export {authentication};