const bcrypt = require('bcrypt');

const generateRandomPassword = (length = 12) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

const hashingPassword = async (passwordStr) => {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(passwordStr, saltRounds);
    return hashed;
  }


const verifyHashedPassword = async (plainPassword, hash) => {
  const match = await bcrypt.compare(plainPassword, hash);
  return match;
};

module.exports = {
  generateRandomPassword,
  hashingPassword,
  verifyHashedPassword,
};