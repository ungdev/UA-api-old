/**
 * GET /status
 *
 * Response:
 * {
 *    db: Boolean
 *    http: Boolean
 * }
 */

module.exports = (app) => {
  app.get('/status', async (req, res) => {
    let db = true;
    const http = true;

    try {
      await app.locals.db.authenticate();
    }
    catch (err) {
      db = false;
    }

    return res
      .status(200)
      .json({ db, http })
      .end();
  });
};
