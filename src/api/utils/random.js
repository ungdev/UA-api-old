// Generates a random number of fixed-length size
// See https://stackoverflow.com/a/27725806
module.exports = (length = 12) => Math.floor(
  10 ** (length - 1) + Math.random() * 10 ** length - 10 ** (length - 1) - 1,
);
