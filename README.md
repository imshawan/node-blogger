## Node Blogger

Node Blogger is a simple open-source blogging application for the ones who loves content creation along with with powerful admin controls, and effortless site management.

## Getting Started

### Prerequisites
- Nodejs ≥ 16.x
- Npm 8.x.x

## Development Setup

### 1. Setup NodeJS using NVM

#### Linux:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
nvm install 16
nvm use 16
```
For more details you can visit the official [NVM GitHub repository](https://github.com/nvm-sh/nvm)

#### Windows:
Download and install NVM setup installer from: https://github.com/coreybutler/nvm-windows/releases

```bash
nvm install 16
nvm use 16
```

### 2. Clone the Repo
```bash
git clone https://github.com/imshawan/NodeBlogger.git
```

### 3. Navigate to Project Folder
```bash
cd NodeBlogger
```

### 4. Install Dependencies
```bash
npm install
```

## Setup and Create the First User (Administrator)

### Generating Your Auth Secret (for setup)
- Using OpenSSL
  ```bash
  openssl rand -hex 32
  ```
- Using OpenSSL (Base64 Encoded String)
  ```bash
  openssl rand -base64 32
  ```
  This secret can be used in config.json as
  ```json
  {
    ...
    "secret": "base64 string"
  }
  ```

Run the web setup installer using the following command:
```bash
npm run setup
```

During the installation process, you'll be prompted to create the first user.

## Available Scripts

### `npm run dev`

Run the server in development mode.

### `npm test`

Run all unit-tests with hot-reloading.

### `npm test -- --file="name of test file" (i.e. --file=users).`

Run a single unit-test. You need not write the entire file name such as ``users.spec.ts``

### `npm run test:no-reloading`

Run all unit-tests without hot-reloading.

### `npm run lint`

Check for linting errors.

### `npm run build`

Build the project for production.

### `npm run clean`

Clears the existing distribution files generated from build process

### `npm run generate-changelog`
Generates change log file by reading the commits created on the current branch

### `npm start`

Run the production build (Must be built first).

### `npm start -- --env="name of env file" (default is production).`

Run production build with a different env file.


## Additional Notes

- If `npm run dev` gives you issues with bcrypt on MacOS you may need to run: `npm rebuild bcrypt --build-from-source`. 
