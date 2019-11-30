const axios = require('axios');
const SendNotification = async (title, content, params) => {
  axios.post(
    'https://onesignal.com/api/v1/notifications',
    {
      contents: {
        fr: content,
        en: content,
      },
      headings: {
        fr: title,
        en: title,
      },
      app_id: process.env.ONESIGNAL_ID,
      ...params,
    }, {
      headers: {
        Authorization: `Basic ${process.env.ONESIGNAL_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
};

/**
 * Send a notification to all tournaments. if tournamentId is null, broadcast to all tournaments
 * @param {string} title
 * @param {string} content
 * @param {string} tournamentId if null, broadcast to all tournaments
 */
const SendNotificationToTournament = (title, content, tournamentId) => {
  const params = tournamentId ? {
    included_segments: ['Subscribed Users'],
    filters: [
      {
        field: 'tag',
          key: 'tournamentId',
          relation: '=',
          value: tournamentId,
      },
    ],
  } : { included_segments: ['Subscribed Users'] };
  SendNotification(title, content, params);
};

module.exports = { SendNotification, SendNotificationToTournament };
