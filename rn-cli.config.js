const blacklist = require('metro/src/blacklist');

module.exports = {
    getBlacklistRE: function () {
        return blacklist([/cloud-functions\/.*/]);
    }
};