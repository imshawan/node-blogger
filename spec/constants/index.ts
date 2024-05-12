/**
 * @date 10-09-2023
 * @author imshawan <github@imshawan.dev>
 * @description Constants required for the testing suite of NodeBlogger
 * 
 * This constant file contains predefined user credentials and other required constants for testing purposes. 
 * It's a valuable resource for ensuring the reliability and functionality of NodeBlogger
 * 
 * These constants enable us to easily simulate various scenarios and test the robustness of our application's 
 * core features. By using these predefined values, we can ensure that our tests remain consistent and effective, 
 * helping us catch and fix issues early in the development process.
*/

export const testUserCredentials = {
    username: 'testuser_99',
    password: 'new_user@123',
    confirmpassword: 'new_user@123',
    email: 'testuser_99@nodeblogger.com',
    userid: 0
}

export const invalidCredentials = {
    username: 'boblexx',
    password: 'bob@123x'
}
