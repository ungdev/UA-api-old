const etupay = require('@ung/node-etupay')({
    id: process.env.ARENA_ETUPAY_ID,
    url: process.env.ARENA_ETUPAY_URL,
    key: process.env.ARENA_ETUPAY_KEY,
});

const errorHandler = require('../../utils/errorHandler');
const { isTournamentFull } = require('../../utils/isFull');
const removeAccent = require('../../utils/removeAccents');

const ITEM_PLAYER_ID = 1;
const ITEM_VISITOR_ID = 2;
const euro = 100;
const { Basket } = etupay;

/**
 * Execute a paiement from a specified user, regarding a specified cart
 * @param {string} userIdString the name of the user id to look for in the route paramater
 * @param {string} cartIdString the name of the cart id to look for in the route paramater
 * @param {*} userModel the model to query for user
 * @param {*} tournamentModel the model to query for tournament
 * @param {*} teamModel the model to query for team
 * @param {*} itemModel the model to query for item
 * @param {*} cartModel the model to query for cart
 * @param {*} cartItemModel the model to query for carts items
 * @param {*} attributeModel the model to query for attribute
 *
 */
const PayCart = (
    userIdString,
    cartIdString,
    userModel,
    tournamentModel,
    teamModel,
    itemModel,
    cartModel,
    cartItemModel,
    attributeModel
) => {
    return async (req, res) => {
        const userId = req.params[userIdString];
        const cartId = req.params[cartIdString];
        try {
            const cart = await cartModel.findOne({
                where: {
                    id: cartId,
                    userId: userId,
                    transactionState: 'draft',
                },

                include: {
                    model: cartItemModel,
                    attributes: ['id', 'quantity', 'forUserId'],
                    include: [
                        {
                            model: itemModel,
                            attributes: [
                                'name',
                                'key',
                                'price',
                                'stock',
                                'infos',
                                'id',
                            ],
                        },
                        {
                            model: attributeModel,
                            attributes: ['label', 'value'],
                        },
                    ],
                },
            });

            if (!cart) {
                return res
                    .status(404)
                    .json({ error: 'NOT_FOUND' })
                    .end();
            }

            if (
                cart.cartItems.some(
                    cartItem => cartItem.item.id === ITEM_VISITOR_ID
                )
            ) {
                const visitorItem = await itemModel.findByPk(ITEM_VISITOR_ID);

                const maxVisitors = visitorItem.stock;

                const actualVisitors = await cartItemModel.sum('quantity', {
                    where: {
                        itemId: ITEM_VISITOR_ID,
                    },
                    include: [
                        {
                            model: cartModel,
                            attributes: [],
                            where: {
                                transactionState: 'paid',
                            },
                        },
                    ],
                });

                const visitorsOrdered = cart.cartItems.reduce(
                    (previousValue, cartItem) => {
                        if (cartItem.item.id !== ITEM_VISITOR_ID) {
                            return previousValue;
                        }
                        return previousValue + cartItem.quantity;
                    },
                    0
                );

                if (maxVisitors - actualVisitors - visitorsOrdered < 0) {
                    return res
                        .status(400)
                        .json({ error: 'VISITOR_FULL' })
                        .end();
                }
            }
            if (
                cart.cartItems.some(
                    cartItem => cartItem.item.id === ITEM_PLAYER_ID
                )
            ) {
                await Promise.all(
                    cart.cartItems.map(async cartItem => {
                        if (cartItem.item.id === ITEM_PLAYER_ID) {
                            const team = await teamModel.findByPk(
                                req.user.teamId,
                                {
                                    include: [
                                        {
                                            model: tournamentModel,
                                            include: [
                                                {
                                                    model: teamModel,
                                                    include: [userModel],
                                                },
                                            ],
                                        },
                                    ],
                                }
                            );
                            const isFull = await isTournamentFull(
                                team.tournament,
                                req
                            );
                            if (isFull) {
                                return res
                                    .status(400)
                                    .json({ error: 'TOURNAMENT_FULL' })
                                    .end();
                            }
                        }
                        return null;
                    })
                );
            }

            const data = JSON.stringify({ cartId: cart.id });
            const encoded = Buffer.from(data).toString('base64');

            const basket = new Basket(
                'Inscription UTT Arena',
                removeAccent(req.user.firstname),
                removeAccent(req.user.lastname),
                req.user.email,
                'checkout',
                encoded
            );

            const isPartnerSchool = process.env.ARENA_PRICES_PARTNER_MAILS.split(
                ','
            ).some(school => req.user.email.toLowerCase().endsWith(school));

            cart.cartItems.forEach(cartItem => {
                if (
                    cartItem.item.key === 'player' &&
                    isPartnerSchool &&
                    cartItem.forUserId === req.user.id
                ) {
                    // todo: HARDECODE !!!!!
                    cartItem.item.price = 15;
                }

                const name = cartItem.attribute
                    ? `${cartItem.item.name} ${cartItem.attribute.label}`
                    : cartItem.item.name;
                basket.addItem(
                    name,
                    cartItem.item.price * euro,
                    cartItem.quantity
                );
            });

            return res
                .status(200)
                .json({ url: basket.compute() })
                .end();
        } catch (err) {
            return errorHandler(err, res);
        }
    };
};

module.exports = PayCart;
