/**
 * Construct an array with one IP given as input. if the input is an array, return the array
 * @param {string|array} arrayOrSingleIp either a string or an array of string containing the ip
 * @return {array} an array of string containing the ips
 */
const getIpArray = arrayOrSingleIp => {
    let arrayOfIp = [];
    if (Array.isArray(arrayOrSingleIp)) {
        arrayOfIp = arrayOrSingleIp;
    } else {
        arrayOfIp.push(arrayOrSingleIp);
    }
    return arrayOfIp;
};

/**
 * Check if the given ip is in the list of authorized ip
 * @param {string} ipToTest the ip to test against the list
 * @param {array} listOfIp the list of authorized ip
 * @return bool
 */
const isIpOkay = (ipToTest, listOfIp) => {
    const recognizedIp = listOfIp.filter(ip => ip === ipToTest);
    return recognizedIp.length > 0;
};

/**
 * Restrict the routes to the ip given in parameter
 * it is equivalent to whitelist an IP or a set of IP
 *
 * @param {string|array} ipAddress ip or list of Ip to whitelist
 */
const RestrictToIP = authorizedIpAddress => {
    return async (request, response, next) => {
        const ipArray = getIpArray(authorizedIpAddress);
        if (isIpOkay(request.ip, ipArray)) {
            next();
        } else {
            response.json({ message: 'FORBIDDEN_IP' });
        }
    };
};

module.exports = RestrictToIP;
