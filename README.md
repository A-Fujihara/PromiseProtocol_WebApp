# Promise Protocol

## Local Setup

### Frontend (React)

1. Fork the repository
   - Go to https://github.com/A-Fujihara/PromiseProtocol_WebApp
   - Click the Fork button in the top right
2. Clone your fork

```
git clone https://github.com/YOUR-USERNAME/PromiseProtocol_WebApp.git
cd PromiseProtocol_WebApp
```

3. Install dependencies

```
npm install
```

4. Copy the environment variables template

```
cp .env.example .env
```

5. Start the development server

```
npm run dev
```

6. Open your browser and go to http://localhost:5173

---

### Backend (Express)

1. Navigate to the server directory

```
cd server
```

2. Install dependencies

```
npm install
```

3. Copy the environment variables template

```
cp .env.example .env
```

4. Start the server

```
node server.js
```

5. Server will be running at http://localhost:3001

---

## Testing

### Frontend Tests (Vitest)

Frontend tests use [Vitest](https://vitest.dev/) and are located in `src/`. Test files must follow the naming convention `ComponentName.test.jsx` or `serviceName.test.js`.

Run frontend tests from the project root:

```
npm run test
```

To run with the interactive UI:

```
npm run test:ui
```

Tests use mocked API responses via `vi.mock()` — do not make live API calls in tests.

### Backend Tests (Jest)

Backend tests use [Jest](https://jestjs.io/) and are located in `server/__tests__/`.

Run backend tests from the `server/` directory:

```
cd server
npm run test
```

---

## Code Formatting (Prettier)

This project uses [Prettier](https://prettier.io/) to enforce consistent formatting across the codebase. The config is defined in `.prettierrc` at the project root.

Format all files from the project root:

```
npm run format
```

Prettier is integrated with ESLint via `eslint-config-prettier` to avoid conflicts. It is recommended to enable "Format on Save" in your editor using the Prettier extension.

---

## Dependencies

- **Axios:** [axios-http.com](https://axios-http.com)
- **Vitest:** [vitest.dev](https://vitest.dev)
- **Prettier:** [prettier.io](https://prettier.io)
- **Testing Library:** [testing-library.com](https://testing-library.com)
