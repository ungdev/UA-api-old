module.exports = (err, res) => {
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ error: 'DUPLICATE_ENTRY' }).end()
  }

  return res.status(500).json({ error: 'UNKNOWN' }).end()
}
