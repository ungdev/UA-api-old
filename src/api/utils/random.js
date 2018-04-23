// Generates a random number of fixed-length size
// See https://stackoverflow.com/a/27725806
module.exports = (length = 12) => {
  return Math.floor(
    Math.pow(10, length - 1) +
    Math.random() *
    (
      Math.pow(10, length) -
      Math.pow(10, length - 1) -
      1
    )
  )
}
