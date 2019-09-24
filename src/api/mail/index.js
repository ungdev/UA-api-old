const fs = require('fs');
const nodemailer = require('nodemailer');
const path = require('path');
const mustache = require('mustache');


const templates = fs
  .readdirSync(__dirname)
  .filter((f) => f !== 'index.js')
  .map((name) => {
    const html = fs.readFileSync(path.join(__dirname, name, 'mail.html')).toString();
    const text = fs.readFileSync(path.join(__dirname, name, 'mail.txt')).toString();
    const subject = fs
      .readFileSync(path.join(__dirname, name, 'subject.txt'))
      .toString()
      .trim();

    mustache.parse(html);
    mustache.parse(text);

    return { name, html, text, subject };
  });

module.exports = async (name, to, data) => {
  const mail = templates.find((template) => template.name === name);

  if (!mail) {
    throw new Error(`Cannot find template ${name}`);
  }

  const transporter = nodemailer.createTransport(process.env.ARENA_MAIL_SMTP);

  return await transporter.sendMail({
    from: process.env.ARENA_MAIL_SENDER,
    to,
    subject: mail.subject,
    html: mustache.render(mail.html, data),
    text: mustache.render(mail.text, data),
  });
};
