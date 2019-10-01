const ExtendableError = require('./ExtendableError');

/**
 * Class representing an API error.
 * @extends ExtendableError
 */
class APIError extends ExtendableError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor({ message, errors, stack, status = 500, isPublic = false }) {
    super({ message, errors, status, isPublic, stack });
  }
}

module.exports = APIError;
