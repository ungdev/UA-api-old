const { Op } = require('sequelize');

const querySearch = (search) => ({
  [Op.or]: [
    {
      email: {
        [Op.like]: `%${search}%`,
      },
    },
    {
      username: {
        [Op.like]: `%${search}%`,
      },
    },
    {
      firstname: {
        [Op.like]: `%${search}%`,
      },
    },
    {
      lastname: {
        [Op.like]: `%${search}%`,
      },
    },
  ],
});

module.exports = querySearch;