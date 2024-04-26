# Installation Guide

To install NodeBlogger, follow these steps:

### Prerequisites
- Node.js ≥ 18.x
- npm 10.x.x

Before installing Nodeblogger, ensure that you have Node.js and npm installed on your system. If Node.js and npm are not installed or if you need to update them, please refer to the official [nodejs.org](https://nodejs.org/) website for installation instructions.

Now, let's proceed with the installation steps:

1. **Download the Codebase:** First, download the NodeBlogger codebase from GitHub. You can do this by cloning the repository using Git. Open your terminal and run the following command to clone the repository to your local machine:

    ```
    git clone https://github.com/imshawan/NodeBlogger.git
    ```

2. **Navigate to the Project Directory:** After downloading the codebase, navigate to the project directory using the following command:

    ```
    cd NodeBlogger
    ```

3. **Install Dependencies:** Once you're inside the project directory, install the dependencies by running the following command:

    ```
    npm install
    ```

4. **Build Files:** After installing the dependencies, run the following command to build the necessary files:

    ```
    npm run build
    ```

5. **Setup Installer:** Once the dependencies are installed and the files are built, you can start the installation process. Run the following command to begin the setup:

    ```
    npm run setup
    ```

6. **Installation Screens:**
   
   - **Basic Details Setup:** The installer will prompt you to set up basic details such as the host URL where the blog will be running and MongoDB database configuration.
   
   - **Admin/First User Creation:** Next, you'll be asked to create the admin or first user account for the blog. Provide the necessary details as prompted.
   
   - **Finishing Up Installation:** After completing the user creation step, the installer will finalize the installation process.

7. **Start NodeBlogger:** Once the installation is complete, you can start NodeBlogger by running the following command:

    ```
    npm run start
    ```

Congratulations! NodeBlogger is now installed and ready to use. You can access your blog at the specified host URL and begin creating and managing your content.

If you encounter any issues during the installation process or have any questions, feel free to reach out to us for assistance.
