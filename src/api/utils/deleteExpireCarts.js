const { Op } = require('sequelize');

module.exports = async function deleteExpire(Cart) {
  const date = new Date();
  const dateBefore = new Date();
  dateBefore.setMinutes(date.getMinutes() - 15);
  await Cart.destroy({
    where: {
      updatedAt: {
        [Op.lt]: dateBefore,
      },
      transactionState: 'draft',
    },
  });
};