// save as hash.js and run with: node hash.js
const bcrypt = require('bcryptjs');

async function hash() {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash("123456", salt);   // change password here
  console.log("HASHED PASSWORD:\n", hashed);
}
hash();
