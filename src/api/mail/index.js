const mustache = require('mustache');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const template = fs.readFileSync(path.join(__dirname, 'mail.html')).toString();

/**
 * Pour remplacer la génération le HTML
 *
 * Bien mettre dans le texte les tags {{ title }} {{ subtitle }} {{{ content  }}} {{ button_title }} sur MailChimp
 * Après l'exportation du HTML, rempalacer manuellement le lien du bouton par {{=<% %>=}}{{ button_link }}<%={{ }}=%>
 * Cela permet d'ignorer les tags lors du premier render de mustache pour être render au deuxième
 */

const register = {
  title: 'Activez votre compte - UTT Arena 2019',
  data: mustache.render(template, {
    title: 'INSCRIPTION',
    subtitle: "Bienvenue à l'UTT Arena, {{ username }} !",
    content: 'Merci de vérifier votre e-mail en cliquant sur le bouton ci-dessous.',
    button_title: 'CONFIRMER MON INSCRIPTION' }),
};

const reset = {
  title: 'Changez votre mot de passe - UTT Arena 2019',
  data: mustache.render(template, {
    title: 'MOT DE PASSE OUBLIÉ',
    subtitle: 'Bonjour {{ username }} !',
    content: 'Vous avez demandé à changer votre mot de passe. Cliquez sur le bouton ci-dessous pour continuer.',
    button_title: 'CHANGER MON MOT DE PASSE',
  }),
};

const payment = {
  title: 'Confirmation de votre commande - UTT Arena 2019',
  data: mustache.render(template, {
    title: 'PAIEMENT',
    subtitle: 'Félicitations {{ username }}, votre commande est confirmée !',
    content: 'Si vous avez acheté une place, elle est disponible en pièce jointe de ce mail ou dans l\'onglet "Mon compte" sur le site.<br />Vous pouvez accéder à votre commande en cliquant sur le bouton ci-dessous.',
    button_title: 'CONSULTER MA COMMANDE',
  }),
};

const sendMail = (type, to, data, attachments = []) => {
  const transporter = nodemailer.createTransport(process.env.ARENA_MAIL_SMTP);

  return transporter.sendMail({
    from: process.env.ARENA_MAIL_SENDER,
    to,
    subject: type.title,
    html: mustache.render(type.data, data),
    attachments,
  });
};

module.exports = { sendMail, register, reset, payment };