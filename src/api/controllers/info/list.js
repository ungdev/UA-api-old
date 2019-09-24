const errorHandler = require('../../utils/errorHandler');
const isAuth = require('../../middlewares/isAuth');


module.exports = (app) => {
  app.get('/infos/:id/:start-:end', [isAuth()]);
  app.get('/infos/:id/:start-:end', async (req, res) => {
    const { Info } = req.app.locals.models;

    try {
      if (!req.params.start || !req.params.end || !req.params.id) return res.status(400).json('Missing params').end();

      let infos = await Info.findAll({
        order: [
          ['createdAt', 'DESC'],
        ],
        where: {
          spotlightId: req.params.id,
          deleted: false,
        },
      });
      infos = infos.slice(req.params.start, req.params.end);

      return res
        .status(200)
        .json(infos)
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
