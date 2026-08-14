# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

---

## Firebase role setup (one-time)

This project uses Firestore to store user roles. To assign the initial `superAdmin` user, run the one-time script below locally using a Firebase service account JSON file (never commit the service account to the repo):

1. Install dev dependencies:

```bash
npm install
```

2. Run the script (replace the path and email):

```bash
node scripts/set-superadmin.js --serviceAccount=./serviceAccountKey.json --email=7791.2023@students.ku.ac.ke
```

This sets a custom claim and updates the `users/{uid}` Firestore document with `role: "superAdmin"`.

3. After that, sign in with the super admin account in the app; the frontend will read the role from Firestore and show the admin dashboard.

## Security rules

There are example `firestore.rules` and `storage.rules` files in the project root. Deploy them to your Firebase project using the Firebase CLI (`firebase deploy --only firestore:rules,storage`). Review and adapt rules before deploying to production.
