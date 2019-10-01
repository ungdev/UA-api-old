const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const moment = require('moment');
const nodemailer = require('nodemailer');


const log = require('./log')(module);

const transporter = nodemailer.createTransport(process.env.ARENA_MAIL_SMTP);

const noTeamHTML = fs.readFileSync(path.join(__dirname, 'remind-no-team-template.html')).toString();
const unpaidHTML = fs.readFileSync(path.join(__dirname, 'remind-unpaid-template.html')).toString();
const noFullTeamHTML = fs.readFileSync(path.join(__dirname, 'remind-no-full-team-template.html')).toString();


module.exports = {
  sendReminderToUnpaidUsers: async (user) => {
    log.info(`[unpaid reminder] sending mail to ${user.email}`);
    const remainingDays = Math.abs(moment().diff('2018-12-07', 'days'));
    mustache.parse(unpaidHTML);
    return transporter.sendMail({
      from: '"UTT Arena" <arena@utt.fr>',
      to: user.email,
      subject: `UTT Arena 2018 - C'est dans ${remainingDays} jours !`,
      html: mustache.render(unpaidHTML, { name: user.name }),
    });
  },
  sendReminderToNotInTeamUsers: async (user) => {
    log.info(`[not in team reminder] sending mail to ${user.email}`);
    const remainingDays = Math.abs(moment().diff('2018-12-07', 'days'));
    mustache.parse(noTeamHTML);
    return transporter.sendMail({
      from: '"UTT Arena" <arena@utt.fr>',
      to: user.email,
      subject: `UTT Arena 2018 - C'est dans ${remainingDays} jours !`,
      html: mustache.render(noTeamHTML, { name: user.name }),
    });
  },
  sendReminderToNotFullTeamUsers: async (user) => {
    log.info(`[not full team reminder] sending mail to ${user.email}`);
    const remainingDays = Math.abs(moment().diff('2018-12-07', 'days'));
    mustache.parse(noFullTeamHTML);
    return transporter.sendMail({
      from: '"UTT Arena" <arena@utt.fr>',
      to: user.email,
      subject: `UTT Arena 2018 - C'est dans ${remainingDays} jours !`,
      html: mustache.render(noFullTeamHTML, { name: user.name, teamName: user.team.name }),
    });
  },
};