import { PassportUserSessionStore } from '@src/utilities';
import { IUser, MutableObject } from '@src/types';
import { getUserByUsername, getUsersByPagination } from '@src/user';
import { Request, Response } from 'express';
import moment from 'moment';

const users: MutableObject = {};

users.get = async function (req: Request, res: Response) {
    var {page, limit, search} = req.query;
    const pageData: MutableObject = {};

    const users = await getUsersByPagination();

    pageData.title = 'Users';
    pageData.users = users;

    res.render('users/index', pageData);
}

users.getByUsername = async function (req: Request, res: Response) {  
    const {username} = req.params;
    const page: MutableObject = {};

    var userData: IUser = await getUserByUsername(username);
    if (!userData) {
        throw new Error('No user found with username ' + username);
    }

    if (userData.joiningDate) {
        userData.joiningDate = moment(new Date(userData.joiningDate)).format('MMMM DD, yyyy');
    }
    
    page.title = userData.fullname || userData.username;
    page.profile = userData;

    res.render('users/profile', page);
}

users.edit = async function (req: Request, res: Response) {  
    // @ts-ignore
    const userid: Number = req.user.userid;
    const {username} = req.params;
    const page: MutableObject = {};
    const sessionStore = new PassportUserSessionStore(req.sessionStore);

    var userData: IUser = await getUserByUsername(username);
    if (!userData) {
        throw new Error('No user found with username ' + username);
    }

    if (userData.joiningDate) {
        userData.joiningDate = moment(new Date(userData.joiningDate)).format('MMMM DD, yyyy');
    }
    
    page.title = userData.fullname || userData.username;
    page.profile = userData;
    page.sessions = await sessionStore.getCurrentUserSessions(userid);

    res.render('users/edit', page);
}

export default users;