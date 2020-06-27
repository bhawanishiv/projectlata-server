const admin = require('firebase-admin');
const db = admin.database();
const devCheck = require('../middleware/dev');
const router = require('express').Router();


/**
 * Checking instance with provided instanceId as query parameter
 */
router.post('/', devCheck, (req, res, next) => {
    res.json(req.instance.val())
});

router.post('/set-readings/:pinNo', devCheck, (req, res, next) => {
    const { pinNo } = req.params;
    if (!pinNo) return res.status(404).json({ status: false, message: 'no pin found' });
    const { value } = req.body;
    if (!value) return res.status(404).json({ status: false, message: 'no value found' });
    const { key } = req.instance;
    db.ref(`/pinDefinitions/${key}`).orderByChild('pinNo').equalTo(pinNo).once('value', (snapshot) => {
        if (!snapshot.val()) return res.status(404).json({ status: false, message: 'no definition found' });
        db.ref(`readings/${key}/${pinNo}`).push({ reading: value, time: new Date().toISOString() }).then(done => {
            res.json({ status: true, message: 'added' })
        });
    })

});

router.post('/get-defs', devCheck, (req, res, next) => {
    const { key } = req.instance;
    db.ref(`pinDefinitions/${key}`).once('value', (snapshot) => {
        console.log(snapshot.val())
        if (!snapshot.val()) return res.status(404).json({ status: false, message: 'not found' });
        let definitions = {};
        snapshot.val().forEach(element => {
            definitions[element['pinNo']] = element['pinMode']
        });
        return res.json(definitions);
    })
});

router.post('/get-cmds', devCheck, (req, res, next) => {
    const { key } = req.instance;
    db.ref(`commands/${key}`).once('value', (snapshot) => {
        if (!snapshot.val()) return res.status(404).json({ status: false, message: 'not found' });
        let commands = {};
        let values = snapshot.val();
        Object.keys(values).forEach(pin => {
            let newCmd = 0;
            Object.keys(values[pin]).forEach(cmd => {
                newCmd = values[pin][cmd]['val'];
                commands[pin] = newCmd;
            })
        })
        return res.json(commands);
    })
});




module.exports = router;