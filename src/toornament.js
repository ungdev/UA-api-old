const axios = require('axios');
const qs = require('querystring');

class Toornament {
  constructor() {
    this.resetAccessToken();
  }

  async resetAccessToken() {
    const data = {
      grant_type: 'client_credentials',
      client_id: process.env.TOORNAMENT_CLIENT_ID,
      client_secret: process.env.TOORNAMENT_CLIENT_SECRET,
      scope: 'organizer:result',
    };
    const resp = await axios.post('https://api.toornament.com/oauth/v2/token',
      qs.stringify(data),
      {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
      });
    const expiresIn = new Date();
    expiresIn.setSeconds(expiresIn.getSeconds() + resp.data.expires_in - 100);
    this.accessToken = resp.data.access_token;
    this.expiresIn = expiresIn;
  }
}

module.exports = new Toornament();