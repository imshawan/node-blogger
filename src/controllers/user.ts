import { PassportUserSessionStore } from '@src/utilities';
import { IUser, MutableObject } from '@src/types';
import { followers as Followers, getUserByUsername, getUsers, isAdministrator } from '@src/user';
import { Request, Response } from 'express';
import moment from 'moment';
import { notFoundHandler } from '@src/middlewares';
import { NavigationManager } from '@src/utilities/navigation';
import * as Helpers from "@src/helpers";

const users: MutableObject = {};

users.get = async function (req: Request, res: Response) {
    const query = req.query,
        userid = Helpers.parseUserId(req);

    let perPage = Number(query.perPage);
    let page = Number(query.page);

    if (!perPage) {
        perPage = 15;
    }
    if (isNaN(page) || !page) {
        page = 1;
    }

    const pageData: MutableObject = {};

    const data = await getUsers({ perPage, page });
    const totalPages = Math.ceil(data.total / perPage);

    pageData.title = 'Users';
    pageData.users = data.users;
    pageData.navigation = new NavigationManager().get('users');
    pageData.pagination = Helpers.generatePaginationItems(req.url, page, totalPages);

    res.render('users/index', pageData);
}

users.getByUsername = async function (req: Request, res: Response) {  
    const {username} = req.params;
    const userid = Helpers.parseUserId(req);
    const page: MutableObject = {};

    var userData: IUser | null = await getUserByUsername(username);
    if (!userData) {
        return notFoundHandler(req, res);
    }

    if (userData.joiningDate) {
        userData.joiningDate = moment(new Date(userData.joiningDate)).format('MMMM DD, yyyy');
    }

    let isFollowing = false;
    if (userid > 0) {
        isFollowing = await Followers.isFollowing((userData.userid ?? 0), userid);
    }
    
    page.title = userData.fullname || userData.username;
    page.profile = userData;
    page.navigation =  new NavigationManager().get('users');
    page.isFollowing = isFollowing;

    res.render('users/profile', page);
}

users.edit = async function (req: Request, res: Response) {  
    // @ts-ignore
    const userid: Number = Number(req.user.userid);
    const {username} = req.params;
    const page: MutableObject = {};
    const sessionStore = new PassportUserSessionStore(req.sessionStore);

    var userData: IUser | null = await getUserByUsername(username);
    if (!userData) {
        return notFoundHandler(req, res)
    }

    if (userid != Number(userData.userid)) {
        if(!await isAdministrator(userid)) {
            return notFoundHandler(req, res);
        }
    }

    if (userData.joiningDate) {
        userData.joiningDate = moment(new Date(userData.joiningDate)).format('MMMM DD, yyyy');
    }
    
    page.title = userData.fullname || userData.username;
    page.profile = userData;
    page.sessions = await sessionStore.getCurrentUserSessions(userid);
    page.navigation =  new NavigationManager().get('users');

    res.render('users/edit', page);
}

export default users;