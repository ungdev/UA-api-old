/* eslint-disable no-async-promise-executor */
const bwipjs = require('bwip-js');
const fs = require('fs');


const PDFDocument = require('pdfkit');
const path = require('path');
const log = require('../utils/log')(module);

const fond = `data:image/jpg;base64,${fs.readFileSync(path.join(__dirname, '../utils', 'assets', 'billet-ua.jpg'), 'base64')}`;


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

  doc.image(fond, 0, 0, { width: doc.page.width, height: doc.page.height });

  doc
    .font(path.join(__dirname, '../utils', 'assets', 'montserrat.ttf'))
    .fontSize(30)
    .fillColor('white')
    .text(`${user.lastname} ${user.firstname}\n${placeName}`, 400, 50);

  const barecode = await generateBarcode(user);

  doc.image(barecode, 775, 30, { width: 49 });

  const buffers = [];

  doc.on('data', (chunk) => buffers.push(chunk));

  doc.on('end', () => resolve(Buffer.concat(buffers)));

  doc.end();
});