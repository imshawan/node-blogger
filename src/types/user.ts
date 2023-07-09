import { ObjectId } from "bson";

export interface IUser {
    _id?: ObjectId
    _key?: string
    userid?: number
    fullname?: string
    slug?: string
    username?: string
    email?: string
    emailConfirmed?: boolean
    password?: string
    passwordHash?: string
    birthday?: string
    picture?: string
    location?: string
    bio?: string
    about?: string
    joiningDate?: string
    isOnline?: boolean
    lastOnline?: string
    gdprConsent?: boolean
    acceptedTnC?: boolean
}