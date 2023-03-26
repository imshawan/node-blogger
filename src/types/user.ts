import { ObjectId } from "bson"

export interface IUser {
    _id: ObjectId
    userId: Number
    name?: string
    slug: string
    username: string
    email: string
    emailConfirmed?: boolean
    passwordHash?: string
    birthday?: Date
    picture?: string
    location?: string
    bio?: string
    about?: string
    joiningDate?: Date
    status?: string
    lastOnline?: Date
    gdprConsent?: boolean
    acceptedTnC?: boolean
}