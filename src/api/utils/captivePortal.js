const log = require('./log')(module);
const redis = require('./redis');
const getIP = require('./getIP');
const hasOrgaPermission = require('./hasOrgaPermission');

const captivePortal = async (req, user) => {
  const ip = getIP(req);
  const ipParts = ip.split('.').map((e) => parseInt(e));
  const isInUnconnectedNetwork = (
    ipParts[0] === 172 &&
    ipParts[1] === 16 &&
    (ipParts[2] >= 200 && ipParts[2] <= 203) &&
    (ipParts[3] >= 0 && ipParts[3] <= 255)
  );

  const isValidPlayer = user.team && user.team.tournamentId !== 5 && user.place;
  const isOrga = hasOrgaPermission(user.permissions);
  const streamPermission = user.permissions === 'stream' ? '_stream' : '';

  if (!isInUnconnectedNetwork) {
    return false;
  }

  try {
    if (isValidPlayer || isOrga) {
      // Replace dots in IP address by dashes
      // Because the network commission can't easily handle IPs with dots
      const userRedisIP = ip.replace(/\./g, '-');

      // Get MAC of the user from its IP
      await new Promise((resolve, reject) => {
        redis.get(userRedisIP, async (err, mac) => {
          if (err || !mac) {
            const error = mac ? JSON.stringify(err) : `no mac associated to ${userRedisIP} in redis`;
            reject(error);
          }

          let network;
          if(isValidPlayer) {
            switch(user.team.tournamentId) {
              case 1:
              case 2:
                network = 'lol';
                break;
              case 3:
                network = 'fortnite';
                break;
              case 4:
                network = 'csgo';
                break;
              case 6:
                network = 'osu';
                break;
              case 7:
                network = 'libre';
                break;
            }
            network += streamPermission;
          }
          else if(isOrga) {
            network = 'staff';
          }

          if(!network) {
            // It should not happen
            reject(`User ${user.username} has no associated network`);
          }

          // Associate to MAC: { network, firstname, lastname, username, email, place }
          await new Promise((resolve) => {
            redis.set(
              mac,
              JSON.stringify({
                network,
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
                email: user.email,
                place: user.place,
              }),
              resolve,
            );
          });

          log.info(`captive portal successful for ${user.username}, mac = ${mac}`);
          resolve();
        });
      });

      return true;
    }
    else {
      log.warn('captive portal refused : not a valid player or orga');
    }
  }
  catch (err) {
    log.error(err);
  }

  return false;
};

module.exports = captivePortal;