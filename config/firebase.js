const admin = require('firebase-admin');
const serviceAccount = require('./taskboard-pro-52c48-firebase-adminsdk-fbsvc-d4ef96bf82.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
