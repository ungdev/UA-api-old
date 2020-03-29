/**
 * GET /status
 *
 * Response:
 * {
 *    db: Boolean
 *    http: Boolean
 * }
 */

module.exports = async (req, res) =>
  res
    .status(200)
    .send('API UP !')
    .end();
