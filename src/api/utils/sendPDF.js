const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');
const bwipjs = require('bwip-js');
const nodemailer = require('nodemailer');

const log = require('./log')(module);

const transporter = nodemailer.createTransport(process.env.ARENA_MAIL_SMTP);

const fond = `data:image/png;base64,${fs.readFileSync(path.join(__dirname, './', 'assets', 'billet-ua.png'), 'base64')}`;
const mailMessage = `Vous avez acheté votre place pour l'UTT Arena 2018
Vous trouverez la place en format numérique en pièce jointe. Veuillez conserver la place : elle sera nécessaire pour entrer à l'UTT Arena.
À bientôt pour l'UTT Arena !
Toute l'équipe organisatrice`;

const htmlMessage = fs.readFileSync(path.join(__dirname, 'place-template.html'));

function generateBarcode(user) {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer({
      bcid: 'ean13',
      text: user.barcode.substr(0, 12),
      height: 10,
      includetext: false,
    }, (err, png) => {
      if (err) {
        log.info(err);
        reject(err);
      }
      resolve(png);
    });
  });
}

function generatePdf(user, barcode) {
  return new Promise((resolve) => {
    const doc = new PDFDocument();

    doc.image(fond, 0, 0, { width: doc.page.width, height: doc.page.height });
    let scoup = '';
    const order = user.orders.find((order) => order.place && order.paid);
    if (order.kaliento) scoup = `${scoup}, kaliento`;
    if (order.mouse) scoup = `${scoup}, souris`;
    if (order.keyboard) scoup = `${scoup}, clavier`;
    if (order.headset) scoup = `${scoup}, casque`;
    if (order.chair) scoup = `${scoup}, chaise gaming`;
    if (order.screen24) scoup = `${scoup}, écran 24"`;
    if (order.screen27) scoup = `${scoup}, écran 27"`;
    if (order.laptop) scoup = `${scoup}, PC portable`;
    if (order.gamingPC) scoup = `${scoup}, PC gaming`;
    if (order.streamingPC) scoup = `${scoup}, PC streaming`;
    if (scoup.length > 0) scoup = scoup.substr(2, scoup.length);
    if (order.shirt === 'none') order.shirt = 'aucun';
    else {
      const gen = order.shirt.substr(0, 1) === 'h' ? 'Homme' : 'Femme';
      const size = order.shirt.substr(1, order.shirt.length).toUpperCase();
      order.shirt = `${gen} ${size}`;
    }
    doc
      .font(`${__dirname}/assets/ua-2018.ttf`)
      .fontSize(30)
      .text(`${user.lastname} ${user.firstname}`, 204, 240)
      .text(`${user.plusone ? 'Accompagnateur' : 'Joueur'}`, 120, 276)
      .text(`${order.shirt}`, 140, 312)
      .text(`${order.ethernet ? 'oui' : 'non'}`, 165, 349)
      .text(`${order.ethernet7 ? 'oui' : 'non'}`, 165, 386)
      .text(`${order.tombola}`, 153, 421)
      .text(`${scoup}`, 158, 457);

    doc.image(barcode, 364, 152, { height: 49 });

    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));

    doc.on('end', () => resolve(Buffer.concat(buffers)));

    doc.end();
  });
}

module.exports = async (user) => {
  const barcode = await generateBarcode(user);
  const pdf = await generatePdf(user, barcode);

  log.info(`[generatePdf] sending mail to ${user.email}`);
  return transporter.sendMail({
    from: '"UTT Arena" <arena@utt.fr>',
    to: user.email,
    subject: 'Place UTT Arena 2018',
    text: mailMessage,
    html: htmlMessage,
    attachments: [
      { filename: 'UTT.Arena.2018.pdf', content: pdf },
    ],
  });
};