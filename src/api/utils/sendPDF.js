const fs = require('fs')
const path = require('path')
const log = require('./log')(module)
const env = require('../../env')

const PDFDocument = require('pdfkit')
const bwipjs = require('bwip-js')
const transporter = require('nodemailer').createTransport(env.ARENA_MAIL_SMTP)

const shirt = {
  none: 'Non',
  fxs : 'Femme — XS',
  fs  : 'Femme — S',
  fm  : 'Femme — M',
  fl  : 'Femme — L',
  fxl : 'Femme — XL',
  mxs : 'Homme — XS',
  ms  : 'Homme — S',
  mm  : 'Homme — M',
  ml  : 'Homme — L',
  mxl : 'Homme — XL'
}

const logoPath = path.join(__dirname, './', 'assets', 'ua2018.png')
let logo = fs.readFileSync(logoPath, 'base64')
logo = `data:image/jpeg;base64,${logo}`

const rogPath = path.join(__dirname, './', 'assets', 'asusrog.png')
let rog = fs.readFileSync(rogPath, 'base64')
rog = `data:image/png;base64,${rog}`

const meltdownPath = path.join(__dirname, './', 'assets', 'meltdown.png')
let meltdown = fs.readFileSync(meltdownPath, 'base64')
meltdown = `data:image/png;base64,${meltdown}`

const mailMessage = `Vous avez acheté votre place pour l'UTT Arena 2018
Vous trouverez la place en format numérique en pièce jointe. Veuillez conserver la place : elle sera nécessaire pour entrer à l'UTT Arena.
À bientôt pour l'UTT Arena !
Toute l'équipe organisatrice`

const htmlMessage = fs.readFileSync(path.join(__dirname, 'template.html'))

function generateBarcode(user) {
  log.info('USER BARCODE', user.barcode)
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer({
      bcid: 'ean13',
      text: user.barcode,
      height: 10,
      includetext: false
    }, function (err, png) {
      if (err) {
        log.info(err)
        reject(err)
      }

      resolve(png)
    })
  })
}

function generatePdf(user, barcode) {
  return new Promise((resolve, reject) => {

    const doc = new PDFDocument()

    doc.image(logo, (doc.page.width - 350) / 2, 30, { width: 350, height: 350 })

    doc
        .fontSize(20)
        .text(`Nom: ${user.name}`, 20, 400)
        .text(`T-Shirt: ${shirt[user.shirt || 'none']}`, 20, 420)
        .text(`${user.plusone ? 'Accompagnateur' : 'Joueur'}`, 20, 440)

    //doc.image(barcode, 215, 500)

    doc.image(rog, 70, 575, { width: 171, height: 35 })
    doc.image(meltdown, 367, 575, { width: 66, height: 61 })

    const buffers = []

    doc.on('data', chunk => buffers.push(chunk))

    doc.on('end', () => resolve(Buffer.concat(buffers)))

    doc.end()
  })
}

module.exports = async (user) => {
  //const barcode = await generateBarcode(user)
  const barcode = 01234
  log.info('before generation')
  const pdf = await generatePdf(user, barcode)
  
  log.info(`[generatePdf] sending mail to ${user.email}`)

  return transporter.sendMail({
      from: '"UTT Arena" <arena@utt.fr>',
      to: user.email,
      subject: 'Place UTT Arena 2018',
      text: mailMessage,
      html: htmlMessage,
      attachments: [
          { filename: `UTT.Arena.2018.pdf`, content: pdf }
      ]
  })
}