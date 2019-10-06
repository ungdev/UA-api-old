const mustache = require('mustache');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

/**
 * Pour l'instant, pour générer: (Pas opti, donc à changer ^^)
 * yarn run mjml src/api/mail/register/payment.mjml -o src/api/mail/register/payment.html
 * cat src/api/mail/register/payment.html | html-to-text > src/api/mail/register/register.txt
 *
 * todo: generaliser comme le commit precedent
 */

const template = fs.readFileSync(path.join(__dirname, 'payment.html')).toString();

module.exports = (to, data, pdfTickets) => {
  const transporter = nodemailer.createTransport(process.env.ARENA_MAIL_SMTP);

  return transporter.sendMail({
    from: process.env.ARENA_MAIL_SENDER,
    to,
    subject: 'Confirmation de votre commande',
    html: mustache.render(template, data),
    attachments: pdfTickets.map((pdfTicket, index) => ({
      filename: `Ticket_UA_${index + 1}.pdf`,
      content: pdfTicket,
    })),
  });
};