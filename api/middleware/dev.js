const admin = require('firebase-admin');
const db = admin.database();
module.exports = (req, res, next) => {
    const { instanceId } = req.body;
    if (!instanceId) return res.status(404).json({ status: false, data: 'no instance provided' });
    db.ref(`instances/${instanceId}`).once('value', (snapshot) => {
        if (!snapshot.val()) return res.status(404).json({ status: false, data: 'invalid instance' });
        req.instance = snapshot;
        next();
    })
}