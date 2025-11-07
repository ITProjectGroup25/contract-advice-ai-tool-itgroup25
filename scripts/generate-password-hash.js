/**
 * Password hash generation tool
 * 
 * Usage:
 * node scripts/generate-password-hash.js "your-new-password"
 * 
 * Then execute the generated SQL in Supabase SQL Editor:
 * SELECT update_admin_password('generated-hash-here');
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Please provide a password');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/generate-password-hash.js "your-new-password"');
  console.log('');
  process.exit(1);
}

const saltRounds = 10;
const hash = bcrypt.hashSync(password, saltRounds);

console.log('');
console.log('✅ Password hash generated successfully!');
console.log('');
console.log('📋 Copy and execute this SQL in Supabase SQL Editor:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`SELECT update_admin_password('${hash}');`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('🔐 New password will be effective immediately after execution');
console.log('');

