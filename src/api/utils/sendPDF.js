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

let meltdown = `data:image/png;base64,${fs.readFileSync(path.join(__dirname, './', 'assets', 'meltdown.png'), 'base64')}`
let rc3 = `data:image/png;base64,${fs.readFileSync(path.join(__dirname, './', 'assets', 'rc3.jpg'), 'base64')}`
let scoupImg = `data:image/png;base64,${fs.readFileSync(path.join(__dirname, './', 'assets', 'scoup.png'), 'base64')}`
let silverstone = `data:image/png;base64,${fs.readFileSync(path.join(__dirname, './', 'assets', 'silverstone.png'), 'base64')}`
let noctua = `data:image/png;base64,${fs.readFileSync(path.join(__dirname, './', 'assets', 'noctua.png'), 'base64')}`
let compumsa = `data:image/png;base64,${fs.readFileSync(path.join(__dirname, './', 'assets', 'compumsa.png'), 'base64')}`
let tekliss = `data:image/png;base64,${fs.readFileSync(path.join(__dirname, './', 'assets', 'tekliss.png'), 'base64')}`
let tcm = `data:image/png;base64,${fs.readFileSync(path.join(__dirname, './', 'assets', 'tcm.png'), 'base64')}`

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

    doc.image(logo, (doc.page.width - 277) / 2, 20, { width: 277, height: 397 })
    let scoup = ''
    if(user.kaliento) scoup = `${scoup}, kaliento`
    if(user.mouse) scoup = `${scoup}, souris`
    if(user.keyboard) scoup = `${scoup}, clavier`
    if(user.headset) scoup = `${scoup}, casque`
    if(user.chair) scoup = `${scoup}, chaise gaming`
    if(user.screen24) scoup = `${scoup}, écran 24"`
    if(user.screen27) scoup = `${scoup}, écran 27"`
    if(user.laptop) scoup = `${scoup}, PC portable`
    if(user.gamingPC) scoup = `${scoup}, PC gaming`
    if(user.streamingPC) scoup = `${scoup}, PC streaming`
    if(scoup.length > 0) scoup = scoup.substr(2, scoup.length)
    if(user.shirt === 'none') user.shirt = 'aucun'
    else {
      const gen = user.shirt.substr(0, 1) === 'h' ? 'Homme' : 'Femme'
      const size = user.shirt.substr(1, user.shirt.length).toUpperCase()
      user.shirt = `${gen} ${size}`
    }
    doc
        .fontSize(20)
        .text(`Nom: ${user.lastname}`, 30, 400)
        .text(`Prénom: ${user.firstname}`, 30, 420)
        .text(`T-Shirt: ${user.shirt}`, 30, 440)
        .text(`Câble 5m: ${user.ethernet ? 'oui': 'non'}`, 30, 460)
        .text(`Câble 7m: ${user.ethernet7 ? 'oui': 'non'}`, 30, 480)
        .text(`Matériel: ${scoup}`, 30, 500)
        .text(`Tombola: ${user.tombola}`, 30, 520)
        .text(`${user.plusone ? 'Place Accompagnateur' : 'Place Joueur'}`, 30, 540)

    //doc.image(barcode, 215, 500)

    doc.image(rog, 480, 450, { width: 100 })
    doc.image(meltdown, 260, 560, { width: 100 })
    doc.image(scoupImg, 20, 580, { height: 80 })
    doc.image(rc3, 370, 710, { height: 75 })
    doc.image(noctua, 20, 670, { width: 100 })
    doc.image(compumsa, 130, 670, { height: 50 })
    doc.image(tekliss, 370, 560, { height: 60 })
    doc.image(tcm, 400, 630, { height: 70 })
    doc.image(silverstone, 130, 730, { height: 50 })

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