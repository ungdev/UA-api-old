# UA-api
API web à destination des services de l'UTT Arena

## Requirements

* [Node.js](https://nodejs.org/) (*LTS Version prefered*)
* [yarn](https://yarnpkg.com/)

## Installation

```
git clone git@github.com:ungdev/UA-api.git
# or
git clone https://github.com/ungdev/UA-api.git

cd UA-api

# To install all the depedencies
yarn

# To create the database and add some fake datas

# if you're running on windows and use powershell.exe or Bash for Windows (WSL) or Linux or Max
yarn seed

# if you're running on windows and use cmd.exe or git bash execute
yarn seed-win
```

## Configuration

```
# copy env file for all environments
cp .env.example .env
# makes your changes in .env, which will not be pushed
nano .env
# you should change ARENA_DB for your database and ARENA_API_DISABLE_LOGIN to enable login
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
UA-api/
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
