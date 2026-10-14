import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const args = process.argv.slice(2);
const uidIndex = args.indexOf("--uid");
const uid = uidIndex >= 0 ? args[uidIndex + 1] : "";
const grant = args.includes("--grant");
const revoke = args.includes("--revoke");
if (!uid || uid.startsWith("--") || grant === revoke) {
    console.error("Usage: node --env-file-if-exists=.env.local scripts/set-admin.mjs --uid FIREBASE_UID --grant|--revoke");
    process.exit(1);
}
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
if (!projectId) throw new Error("Configure FIREBASE_ADMIN_PROJECT_ID");
if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && projectId !== process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) throw new Error("Firebase Admin and client projects must match");
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (Boolean(clientEmail) !== Boolean(privateKey)) throw new Error("Incomplete Firebase Admin credentials");
const app = initializeApp({ projectId, credential: clientEmail && privateKey ? cert({ projectId, clientEmail, privateKey }) : applicationDefault() });
const auth = getAuth(app);
const user = await auth.getUser(uid);
const claims = { ...user.customClaims };
if (grant) claims.admin = true;
else delete claims.admin;
await auth.setCustomUserClaims(uid, claims);
await auth.revokeRefreshTokens(uid);
console.log(`Admin access ${grant ? "granted" : "revoked"} for ${uid} in ${projectId}. Sign in again to refresh permissions.`);
