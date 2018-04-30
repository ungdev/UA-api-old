# UTT Arena API

## Requirements

* [Node.js](https://nodejs.org/)
* [yarn](https://yarnpkg.com/)

## Installation

```
git clone git@github.com:ungdev/arena.utt.fr-api.git
# or
git clone https://github.com/ungdev/arena.utt.fr-api.git

cd arena.utt.fr-api
yarn
```

## Configuration

```
# copy env file for all environments
cp .env .env.local
# makes your changes in .env.local, which will not be pushed
nano .env.local
```

## Commands

```
yarn dev    # development server
yarn start  # production server
yarn serve  # pm2 production server (load balancing)
yarn reload # pm2 hot reload
yarn lint   # prettier lint
```

## Structure

```
arena.utt.fr-api/
├── src/                          # base directory
│   ├── api/                         # api files
│   │   ├── controllers/                # endpoints controllers
│   │   ├── live/                       # socket.io controllers
│   │   ├── middlewares/                # endpoints middlewares
│   │   ├── models/                     # database models
│   │   └── utils/                      # utils files
│   ├── app.js                       # create express server
│   ├── database.js                  # create sequelize connection
│   ├── env.js                       # convert .env and .env.local to JSON
│   ├── index.js                     # entry point
│   └── socket.js                    # create socket.io server
├── .editorconfig                 # define your editor options
├── .env                          # global configuration
└── .env.local                    # override global configuration (not pushed to repository)
```
