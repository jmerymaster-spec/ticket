const getUUID = function() {
    const { randomUUID } = require('crypto');
    const id = randomUUID();
    return(id);
};

module.exports = { getUUID };
