## About

Node Blogger - A simple open-source blogging application powered by NodeJS

## Dependencies
- Node: 16.20.x
- NPM: 8.19.x

## Available Scripts

### `npm run dev`

Run the server in development mode.

### `npm test`

Run all unit-tests with hot-reloading.

### `npm test -- --file="name of test file" (i.e. --file=Users).`

Run a single unit-test.

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
