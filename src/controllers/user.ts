import { IUser, MutableObject } from '@src/types';
import { getUserByUsername } from '@src/user';
import { Request, Response } from 'express';
import moment from 'moment';

const users: MutableObject = {};

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

export default users;