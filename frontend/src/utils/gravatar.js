import md5 from 'md5';

/**
 * Generate Gravatar URL from email address
 * @param {string} email - User email address
 * @param {number} size - Avatar size in pixels (default: 200)
 * @returns {string} Gravatar URL
 */
export const getGravatarUrl = (email, size = 200) => {
    if (!email) return null;

    const hash = md5(email.toLowerCase().trim());
    // d=identicon provides a default avatar if user has no Gravatar
    // d=mp uses a mystery person avatar
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`;
};
