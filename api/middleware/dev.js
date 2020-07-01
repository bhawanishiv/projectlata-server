const admin = require('firebase-admin');
const db = admin.database();
module.exports = (req, res, next) => {
    const { instanceId } = req.body;
    if (!instanceId) return res.status(404).send('error:no-instanceId');
    db.ref(`instances/${instanceId}`).once('value', (snapshot) => {
        if (!snapshot.val()) return res.status(404).json('error:invalid-instance');
        req.instance = snapshot;
        next();
    })
}