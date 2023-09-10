/**
 * @date 10-09-2023
 * @author imshawan <hello@imshawan.dev>
 * 
 * This TypeScript file contains type declarations and interfaces specific to our testing suite.
 * It serves as a central location for defining custom types that are used throughout our testing
 * codebase. By encapsulating these types here, we ensure consistency, improve code readability,
 * and make it easier to maintain and extend our testing suite.
 */

export interface IResponseBody {
    status: {
        success: boolean
        error: string
        route: string
        message: string
    },
    payload: IResponsePayload
    user?: IRegisteredUser
}

export interface IResponsePayload extends {}

/**
 * @description Interface declaration for the new registered user types
 */
interface IRegisteredUser extends IResponsePayload {
    userid: number
    email: string
    username: string
    cookies: string
}