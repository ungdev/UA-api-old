const Express = require('express');

const List = require('./list.js');
const GetTeamsFromTournaments = require('./getTeams');
const Get = require('./get.js');

const Tournament = models => {
    const router = Express.Router();
    router.get('/', List(models.Tournament, models.Team, models.User));
    router.get(
        '/:tournamentId/teams',
        GetTeamsFromTournaments(models.Team, models.User, models.Tournament)
    );
    router.get(
        '/:tournamentId',
        Get(models.Tournament, models.Team, models.User)
    );
    return router;
};

module.exports = Tournament;
