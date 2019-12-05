const axios = require('axios');
const qs = require('querystring');
const log = require('./log')(module);

let axiosToornament;

const initiateAPI = async () => {
  const data = {
    grant_type: 'client_credentials',
    client_id: process.env.TOORNAMENT_CLIENT_ID,
    client_secret: process.env.TOORNAMENT_CLIENT_SECRET,
    scope: 'organizer:result',
  };
  try {
    const resp = await axios.post('https://api.toornament.com/oauth/v2/token',
      qs.stringify(data),
      { headers: { 'content-type': 'application/x-www-form-urlencoded' } },
    );

    axiosToornament = axios.create({
      baseURL: 'https://api.toornament.com/organizer/v2/tournaments',
      headers: {
        'X-Api-Key': process.env.TOORNAMENT_KEY,
        Authorization: `Bearer ${resp.data.access_token}`,
        Range: 'matches=0-64',
      },
    });
  }
  catch (err) {
    log.error(`Failed to initiate toornament API : ${err}`);
  }
};

const APIToornament = {
  matches: ({ toornamentTeam, toornamentId }) => new Promise((resolve, reject) => {
    axiosToornament.get(`${toornamentId}/matches`, {
      params: {
        participant_ids: toornamentTeam,
      },
    })
    .then((res) => {
      resolve(res);
    })
    .catch((err) => {
      reject(err);
    });
  }),
};

module.exports = { APIToornament, initiateAPI };