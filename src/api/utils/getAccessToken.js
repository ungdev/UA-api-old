const axios = require('axios')
const qs = require('querystring')
const env = require('../../env')

module.exports = async (session) => {
    data = {
        grant_type: 'client_credentials',
        client_id: env.TOORNAMENT_CLIENT_ID,
        client_secret: env.TOORNAMENT_CLIENT_SECRET,
        scope: 'organizer:result'
    }
    const resp = await axios.post('https://api.toornament.com/oauth/v2/token',
    qs.stringify(data),
    {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });
    const expiresIn = new Date()
    expiresIn.setSeconds(expiresIn.getSeconds() + resp.data.expires_in)
    console.log('UTILS??')
    session.expiresIn = expiresIn
    session.accessToken = resp.data.access_token
}
  