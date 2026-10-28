// Creates the value for ADMIN_PASSWORD_HASH.
// Usage:  npm run hash-password -- "your admin password"
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];

if (!password || password.length < 10) {
  console.error('Usage: npm run hash-password -- "your admin password"');
  console.error("The password must be at least 10 characters long.");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);

console.log("\nPut this line in .env.local and in your Vercel environment variables:\n");
console.log(`ADMIN_PASSWORD_HASH=scrypt:${salt.toString("hex")}:${hash.toString("hex")}\n`);
