const bcrypt = require('bcryptjs');
const { check } = require('express-validator/check');
const validateBody = require('../../middlewares/validateBody');
const isAuth = require('../../middlewares/isAuth');

const errorHandler = require('../../utils/errorHandler');
const { outputFields, inputFields } = require('../../utils/publicFields');
const log = require('../../utils/log')(module);

/**
 * PUT /user
 * {
 *    name: String
 *    email: String
 *    [password]: String
 * }
 *
 * Response:
 * {
 *    user: User
 * }
 */
module.exports = (app) => {
  app.put('/user', [isAuth('user-edit')]);

  app.put('/user', [
    check('name')
      .exists()
      .matches(/[0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzªµºÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĄąĆćĘęıŁłŃńŒœŚśŠšŸŹźŻżŽžƒˆˇˉμﬁﬂ -]+/i)
      .isLength({ min: 3, max: 90 }),
    check('lastname')
      .exists()
      .matches(/[0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzªµºÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĄąĆćĘęıŁłŃńŒœŚśŠšŸŹźŻżŽžƒˆˇˉμﬁﬂ -]+/i)
      .isLength({ min: 2, max: 200 }),
    check('firstname')
      .exists()
      .matches(/[0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzªµºÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĄąĆćĘęıŁłŃńŒœŚśŠšŸŹźŻżŽžƒˆˇˉμﬁﬂ -]+/i)
      .isLength({ min: 2, max: 200 }),
    check('gender')
      .isIn(['M', 'F', 'N/A'])
      .exists(),
    check('password')
      .optional()
      .isLength({ min: 6 }),
    check('email')
      .exists()
      .isEmail(),
    validateBody(),
  ]);

  app.put('/user', async (req, res) => {
    try {
      if (req.body.password) {
        req.body.password = await bcrypt.hash(
          req.body.password,
          parseInt(process.env.ARENA_API_BCRYPT_LEVEL, 10),
        );
      }

      const body = inputFields(req.body);

      await req.user.update(body);

      log.info(`user ${req.body.name} updated`);

      res
        .status(200)
        .json({ user: outputFields(req.user) })
        .end();
    }
    catch (err) {
      return errorHandler(err, res);
    }
  });
};
