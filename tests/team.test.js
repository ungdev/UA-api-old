const supertest = require('supertest');
const src = require('../src');
const seedAll = require('../db/seed');

describe('Teams', () => {

  let app;
  let token = null;
  let user = null;
  let team = null;
  let request;

  beforeAll(async () => {
    app = await src();
    request = supertest(app);

    await seedAll(app.locals.models, app.locals.sequelize);
  })

  afterAll(async () => {
    await app.locals.sequelize.close()
  })

  it('should log a user without a team', async () => {
    const response = await request.post('/auth/login').send({ username: 'user', password: 'uttarena' });
    const json = JSON.parse(response.text);
    token = json.token;
    user = json.user;

    expect(response.status).toBe(200);
    expect(token).toBeTruthy();
    expect(user.team).toBeFalsy();
  })

  it('should create a team', async () => {
    const response = await request.post('/teams').send({ tournament: 1, teamName: 'Les Lopez Du 59' }).set('X-Token', token);
    const json = JSON.parse(response.text);

    team = json;

    expect(response.status).toBe(200);
    expect(json.tournament.id).toBe(1);
    expect(json.name).toStrictEqual('Les Lopez Du 59');
    expect(json.captainId).toStrictEqual(user.id);
  })

  it('should ask for a team', async () => {
    let response = await request.post('/auth/login').send({ username: 'admin', password: 'uttarena' });
    const json = JSON.parse(response.text);

    expect(response.status).toBe(200);
    expect(json.token).toBeTruthy();
    expect(json.user.team).toBeFalsy();

    response = await request.post(`/teams/${team.id}/request`).set('X-Token', json.token);
    expect(response.status).toBe(204);
  });

  it('should accept the user', async () => {
    let response = await request.get(`/teams/${team.id}`).set('X-Token', token);
    const json = JSON.parse(response.text);

    expect(response.status).toBe(200);
    expect(json.askingUsers.length).toBe(1);

    response = await request.post(`/teams/${team.id}/users`).set('X-Token', token).send({ user: json.askingUsers[0].id });
    expect(response.status).toBe(204);
  })

  it('should delete a team', async () => {
    const { Team } = app.locals.models;

    const countBefore = await Team.count();

    const response = await request.delete(`/teams/${team.id}`).set('X-Token', token);

    const countAfter = await Team.count();

    expect(response.status).toBe(204);
    expect(countAfter).toBe(countBefore - 1);
  })
})