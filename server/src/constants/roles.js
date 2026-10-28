/**
 * Marketplace User Roles
 * STRICT RULE: Only client and freelancer roles are valid.
 * Standard registration must never permit self-granting of admin privileges.
 */
export const USER_ROLES = {
  CLIENT: 'client',
  FREELANCER: 'freelancer'
};

export const ALLOWED_ROLES = [USER_ROLES.CLIENT, USER_ROLES.FREELANCER];
