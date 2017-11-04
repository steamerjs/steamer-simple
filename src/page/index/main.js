if (process.env.NODE_ENV !== 'production') {
    // use it for hot reload
    module.exports = require('./root/Root.dev');
}
else {
    module.exports = require('./root/Root.prod');
}
