const ROLES = Object.freeze({
  STUDENT: 'student',
  MENTOR: 'mentor',
  ADMIN: 'admin',
});

const AUTH_TOKEN_TTL = '7d';

module.exports = {
  ROLES,
  AUTH_TOKEN_TTL,
};
