// Generates a random number of fixed-length size
// See https://stackoverflow.com/a/21816629
module.exports = () => Math.floor(Math.random() * 99999999999 + 100000000000);
