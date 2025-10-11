// utils/phone.js
const { parsePhoneNumberFromString } = require('libphonenumber-js');

function normalizePhone(raw) {
  const pn = parsePhoneNumberFromString(raw);
  if (!pn || !pn.isValid()) throw new Error('Invalid phone');
  return pn.number; // E.164
}

module.exports = { normalizePhone };
