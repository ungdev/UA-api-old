const Express = require('express');

const { ResetPassword, CheckReset } = require('./reset-password.js');
const { Login, CheckLogin } = require('./login.js');
const { ChangePassword, CheckChangePassword } = require('./change-password.js');
const { Register, CheckRegister } = require('./register.js');
const { ValidateAccount, CheckValidate } = require('./validation.js');

const Auth = models => {
  router = Express.Router();
  router.post(
    '/login',
    CheckLogin,
    Login(models.User, models.Team, models.Cart, models.CartItem)
  );
  router.post('/password/reset', CheckReset, ResetPassword(models.User));
  router.put(
    '/password/update',
    CheckChangePassword,
    ChangePassword(models.User)
  );
  router.post('/register', CheckRegister, Register(models.User));
  router.post(
    '/validation',
    CheckValidate,
    ValidateAccount(models.User, models.Team)
  );
  return router;
};

module.exports = Auth;
