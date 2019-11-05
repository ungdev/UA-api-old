const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
/**
 * Serve a file in a specified directory
 * @param {string} fileId the id name for the file in the route parameter
 * @param {string} fileDirectory the directory in which the file should be located
 */
const ServeFile = (fileIdString, fileDirectory) => {
  if (!fs.existsSync(fileDirectory)) {
    throw new Error(`The specified directory doesn't exist : ${fileDirectory}`);
  }
  return async (request, response) => {
    const fileId = request.params[fileIdString];
    const fileCompletePath = path.join(fileDirectory, fileId);
    const mimeType = mime.lookup(fileCompletePath) || 'text-plain';
    try {
      const fileToServe = await fs.promises.readFile(fileCompletePath);
      return response
        .append('Content-Type', mimeType)
        .status(200)
        .end(fileToServe);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return response.status(404).json({ message: 'File not found.' });
      }
    }
  };
};

module.exports = ServeFile;
