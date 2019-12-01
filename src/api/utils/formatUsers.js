module.exports = (users) => {
  return users.map((user) => {
    const carts = user.carts.map((cart) => {
      const price = cart.cartItems.reduce((prev, cartItem) => {
        let itemPrice = cartItem.item.price;
        const partnerMail = process.env.ARENA_PRICES_PARTNER_MAILS.split(',').some((partnerMail) => {
          return cartItem.forUser.email.endsWith(`@${partnerMail}`);
        });

        if(cartItem.item.id === 1 && partnerMail) {
          itemPrice = 15;
        }

        return (prev.item ? prev.item.price : prev) + itemPrice;
      }, 0);

      return {
        ...cart.toJSON(),
        price,
      };
    }, 0);

    return {
      ...user.toJSON(),
      carts,
      isPaid: user.forUser.length,
    };
  });
};