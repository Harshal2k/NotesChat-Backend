const admin = require('firebase-admin');

// Replace the path to your service account key JSON file
const serviceAccount = require('/path/to/your/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
