const mustache = require('mustache');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

/**
 * Pour l'instant, pour générer: (Pas opti, donc à changer ^^)
 * yarn run mjml src/api/mail/register/register.mjml -o src/api/mail/register/register.html
 * cat src/api/mail/register/register.html | html-to-text > src/api/mail/register/register.txt
 *
 * todo: generaliser comme le commit precedent
 */

const template = fs.readFileSync(path.join(__dirname, 'register.html')).toString();

module.exports = (to, data) => {
  const transporter = nodemailer.createTransport(process.env.ARENA_MAIL_SMTP);

  return transporter.sendMail({
    from: process.env.ARENA_MAIL_SENDER,
    to,
    subject: 'Activez votre compte UTT Arena',
    html: mustache.render(template, data),
  });
};