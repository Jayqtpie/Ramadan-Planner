/**
 * Generate unique unlock codes for The Ramadan Reset Planner.
 *
 * Usage: node scripts/generate-codes.js [count]
 * Default: 100 codes
 *
 * Codes follow the format: GB-XXXX-XXXX
 * The last 2 chars are a checksum derived from the first 6 + secret key.
 */

const SECRET_KEY = 'barakah2026ramadan';
const CHARS = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I, O

function computeCheck(payload) {
  let hash = 0;
  const str = payload + SECRET_KEY;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  const c1 = CHARS[Math.abs(hash) % CHARS.length];
  const c2 = CHARS[Math.abs(hash >> 8) % CHARS.length];
  return c1 + c2;
}

function generateCode() {
  let payload = '';
  for (let i = 0; i < 6; i++) {
    payload += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  const check = computeCheck(payload);
  const body = payload + check;
  return `GB-${body.slice(0, 4)}-${body.slice(4, 8)}`;
}

const count = parseInt(process.argv[2]) || 100;
const codes = new Set();

while (codes.size < count) {
  codes.add(generateCode());
}

console.log(`Generated ${count} unique codes:\n`);
for (const code of codes) {
  console.log(code);
}

console.log(`\n--- Copy above codes. Each can be given to one customer. ---`);
