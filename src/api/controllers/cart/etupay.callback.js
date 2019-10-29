const { fn } = require('sequelize');
const etupay = require('../../utils/etupay');
const generateTicket = require('../../utils/generateTicket');
const errorHandler = require('../../utils/errorHandler');
const mail = require('../../mail');
const log = require('../../utils/log')(module);

// todo: SLACK HOOKS !!!!! si differents + enregistrer !!!!!!!!!
/**
 * Check whether the payment service is online
 */
const EtupayAvailable = () => (_, res) => {
  res
    .status(200)
    .json({ message: 'ok' })
    .end();
};

/**
 * Callback used in case of successful payment
 * @param {*} cartModel
 * @param {*} cartItemModel
 * @param {*} itemModel
 * @param {*} attributeModel
 * @param {*} userModel
 */
const SuccessfulPayment = (
  cartModel,
  cartItemModel,
  itemModel,
  attributeModel,
  userModel
) => async (req, res) => {
  try {
    if (!req.query.payload) {
      return res.redirect(
        `${process.env.ARENA_ETUPAY_ERRORURL}&error=NO_PAYLOAD`
      );
    }

    // Récupère le cartId depuis le payload envoyé à /carts/:id/pay
    const { cartId } = JSON.parse(
      Buffer.from(req.etupay.serviceData, 'base64').toString()
    );

    let cart = await cartModel.findOne({
      where: {
        id: cartId,
        transactionState: 'draft',
      },

      include: [
        {
          model: cartItemModel,
          attributes: ['id', 'quantity', 'forUserId'],
          include: [
            {
              model: itemModel,
              attributes: ['name', 'key', 'price', 'infos'],
            },
            {
              model: attributeModel,
              attributes: ['label', 'value'],
            },
          ],
        },
        {
          model: userModel,
          attributes: ['username', 'email'],
        },
      ],
    });

    if (!cart) {
      return res.redirect(
        `${process.env.ARENA_ETUPAY_ERRORURL}&error=CART_NOT_FOUND`
      );
    }

    cart.transactionState = req.etupay.step;
    cart.transactionId = req.etupay.transactionId;

    if (cart.transactionState !== 'paid') {
      await cart.save();
      return res.redirect(
        `${process.env.ARENA_ETUPAY_ERRORURL}&error=TRANSACTION_ERROR`
      );
    }

    cart.paidAt = fn('NOW');
    await cart.save();

    // Comme les PDF prennent du temps à generer, on redirige le user avant
    res.redirect(process.env.ARENA_ETUPAY_SUCCESSURL);

    cart = cart.toJSON();

    cart.cartItems = await Promise.all(
      cart.cartItems.map(async cartItem => {
        const forUser = await userModel.findByPk(cartItem.forUserId, {
          attributes: [
            'id',
            'username',
            'firstname',
            'lastname',
            'email',
            'barcode',
          ],
        });

        const newCartItem = {
          ...cartItem,
          forUser,
        };

        delete newCartItem.forUserId;
        return newCartItem;
      })
    );

    let pdfTickets = await Promise.all(
      cart.cartItems.map(async cartItem => {
        if (cartItem.item.key === 'player' || cartItem.item.key === 'visitor') {
          // todo: moche à cause de sequelize, peut etre moyen de raccourcir en une requête

          return generateTicket(cartItem.forUser, cartItem.item.name);
        }
        return null;
      })
    );

    pdfTickets = pdfTickets
      .filter(ticket => ticket !== null)
      .map((ticket, index) => ({
        filename: `Ticket_UA_${index + 1}.pdf`,
        content: ticket,
      }));

    const users = cart.cartItems.reduce((previousValue, cartItem) => {
      const indexUser = previousValue.findIndex(
        user => user.username === cartItem.forUser.username
      );

      // Si il trouve
      if (indexUser !== -1) {
        previousValue[indexUser].items.push({
          name: cartItem.item.name,
          quantity: cartItem.quantity,
          price: cartItem.item.price * cartItem.quantity,
          attribute: cartItem.attribute ? cartItem.attribute.label : '',
        });
      } else {
        previousValue.push({
          username: cartItem.forUser.username,
          items: [
            {
              name: cartItem.item.name,
              quantity: cartItem.quantity,
              price: cartItem.item.price * cartItem.quantity,
            },
          ],
        });
      }

      return previousValue;
    }, []);

    await mail.sendMail(
      mail.payment,
      cart.user.email,
      {
        username: cart.user.username,
        users,
        button_link: `${process.env.ARENA_WEBSITE}/dashboard/purchases`,
      },
      pdfTickets
    );
    log.debug(`Mail sent to ${cart.user.email}`);
    return res.end();
  } catch (err) {
    return errorHandler(err, res);
  }
};

module.exports = { SuccessfulPayment, EtupayAvailable };
