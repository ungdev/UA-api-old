const supertest = require('supertest');
const src = require('../src');

describe('routes', () => {
  const fakeUser = {
    firstname: 'Kevin',
    lastname: 'Beauf',
    username: 'xXBgDu59Xx',
    password: 'RPZle59',
    email: 'kevin@test.dev'
  }

  let app;
  let token = null;
  let request;

  beforeAll(async () => {
    app = await src();
    request = supertest(app);
  })

  it('should create a user', async () => {
    const response = await request.post('/auth/register').send(fakeUser);
    expect(response.status).toBe(204);
  })

  it('should throw an error (duplicate entry)', async () => {
    const response = await request.post('/auth/register').send(fakeUser);
    expect(response.status).toBe(400);
    expect(JSON.parse(response.text)).toStrictEqual({ error: 'DUPLICATE_ENTRY' });
  })

  it('should throw an error (not validated)', async () => {
    const response = await request.post('/auth/login').send({
      username: fakeUser.username,
      password: fakeUser.password
    });

    expect(response.status).toBe(400);
    expect(JSON.parse(response.text)).toStrictEqual({ error: 'USER_NOT_ACTIVATED' })
  })

  it('should validate account', async () => {
    const { User } = app.locals.models;

    const user = await User.findOne({
      where: {
        username: fakeUser.username
      }
    });

    const response = await request.post('/auth/validation').send({ slug: user.registerToken });
    const json = JSON.parse(response.text);

    fakeUser.id = json.user.id;

    expect(response.status).toBe(200);
    expect(json.user.username).toStrictEqual(fakeUser.username);
    expect(json.user.firstname).toStrictEqual(fakeUser.firstname);
    expect(json.user.lastname).toStrictEqual(fakeUser.lastname);
    expect(json.user.email).toStrictEqual(fakeUser.email);
    expect(json.user.isPaid).toBe(false);
    expect(json.token).toBeTruthy();
  })

  it('should login', async () => {
    const response = await request.post('/auth/login').send({ username: fakeUser.username, password: fakeUser.password });
    const json = JSON.parse(response.text);

    token = json.token;

    expect(response.status).toBe(200);
    expect(json.user.username).toStrictEqual(fakeUser.username);
    expect(json.user.firstname).toStrictEqual(fakeUser.firstname);
    expect(json.user.lastname).toStrictEqual(fakeUser.lastname);
    expect(json.user.email).toStrictEqual(fakeUser.email);
    expect(json.user.isPaid).toBe(false);
    expect(json.token).toBeTruthy();
  })

  it('should return users infos', async () => {
    const response = await request.get(`/users/${fakeUser.id}`).set('X-Token', token);

    expect(response.status).toBe(200);
  });

  it('should return unauthenticated', async () => {
    const response = await request.get(`/users/${fakeUser.id}`);

    expect(response.status).toBe(401);
  });

  it('should edit the user', async () => {
    fakeUser.username = 'FortniteCLeFeu!'
    fakeUser.firstname = 'Le Sang de tes Morts !';
    fakeUser.lastname = 'La calotte de ses morts !';

    const response = await request.put(`/users/${fakeUser.id}`).send(fakeUser).set('X-Token', token);
    const json = JSON.parse(response.text);

    expect(response.status).toBe(200);

    expect(json.username).toBe('FortniteCLeFeu!');
    expect(json.firstname).toBe('Le Sang de tes Morts !');
    expect(json.lastname).toBe('La calotte de ses morts !');
  })
})