/* eslint-disable no-async-promise-executor */
const bwipjs = require('bwip-js');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');

const log = require('./log')(module);

const background = `data:image/jpg;base64,${fs.readFileSync(path.join(__dirname, '../utils', 'assets', 'billet-ua.jpg'), 'base64')}`;

const generateBarcode = (user) => new Promise((resolve, reject) => {
  bwipjs.toBuffer({
    bcid: 'ean13',
    text: user.barcode,
    includetext: true,
    height: 10,
    rotate: 'L',
  }, (err, png) => {
    if (err) {
      log.info(err);
      reject(err);
    }
    resolve(png);
  });
});

module.exports = (user, placeName) => new Promise(async (resolve) => {
  const doc = new PDFDocument({ size: [841.89, 595.28] });
  const barcode = await generateBarcode(user);
  const buffers = [];

  // Create content
  doc.image(background, 0, 0, { width: doc.page.width, height: doc.page.height });
  doc.image(barcode, 764, 70, { width: 49 });
  doc
    .font(path.join(__dirname, '../utils', 'assets', 'montserrat.ttf'), 30)
    .fillColor('white')
    .text(`${user.lastname} ${user.firstname}`, 400, 40)
    .fontSize(20)
    .text(placeName, 400, 80);

  // Return result
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => resolve(Buffer.from(Buffer.concat(buffers)).toString('base64')));
  doc.end();
});