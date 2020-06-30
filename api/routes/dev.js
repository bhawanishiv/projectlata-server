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
    if (!pinNo) return res.status(404).json({ status: false, msg: 'no pin found' });
    const { value } = req.body;
    if (!value) return res.status(404).json({ status: false, msg: 'no value found' });
    const { key } = req.instance;
    db.ref(`/pinDefinitions/${key}`).orderByChild('pinNo').equalTo(pinNo).once('value', (snapshot) => {
        if (!snapshot.val()) return res.status(404).json({ status: false, msg: 'no definition found' });
        db.ref(`readings/${key}/${pinNo}`).push({ reading: value, time: new Date().toISOString() }).then(done => {
            res.json({ status: true, msg: 'added' })
        });
    })

});

router.post('/get-defs', devCheck, (req, res, next) => {
    let defs = "D";
    const { cpuId } = req.instance.val();
    const { key } = req.instance;
    if (!cpuId) return res.status(404).json({ status: false, msg: 'nocpuid' });
    db.ref(`cpus/${cpuId}`).once('value', (snapshot) => {
        const { description } = snapshot.val();
        if (!description) return res.status(404).json({ status: false, msd: 'nodescription' });
        const { pin_configuration } = description;
        if (!pin_configuration) return res.status(404).json({ status: false, msd: 'nopinconfiguration' });
        sortedConfiguration = pin_configuration.sort((a, b) => a['pinNo'] - a['pinNo']);
        db.ref(`pinDefinitions/${key}`).once('value', (defsSnapshot) => {
            if (!defsSnapshot.val()) return res.status(404).json({ status: false, msg: 'nopindefinitions' });
            const definitions = defsSnapshot.val();
            sortedConfiguration.forEach(config => {
                let n = definitions.find(def => def.pinNo == config.pinNo);
                if (n) {
                    const { pinMode } = n;

                    if (pinMode == "input") defs += "1";
                    else if (pinMode == "output") defs += "0";
                } else defs += "2";

            })
            res.json({ data: defs, status: true });
        })

    })
});

router.post('/get-cmds', devCheck, (req, res, next) => {
    let cmds = "C";
    const { cpuId } = req.instance.val();
    const { key } = req.instance;
    if (!cpuId) return res.status(404).json({ status: false, msg: 'nocpuid' });
    db.ref(`cpus/${cpuId}`).once('value', (snapshot) => {
        const { description } = snapshot.val();
        if (!description) return res.status(404).json({ status: false, msd: 'nodescription' });
        const { pin_configuration } = description;
        if (!pin_configuration) return res.status(404).json({ status: false, msd: 'nopinconfiguration' });
        sortedConfiguration = pin_configuration.sort((a, b) => a['pinNo'] - a['pinNo']);
        db.ref(`commands/${key}`).once('value', (cmdsSnapshopt) => {
            if (!cmdsSnapshopt.val()) return res.status(404).json({ status: false, msg: 'not found' });
            let values = cmdsSnapshopt.val();
            sortedConfiguration.forEach(config => {
                let pin = Object.keys(values).find(pin => pin == config.pinNo);
                if (pin) {
                    let newCmd = 0;
                    Object.keys(values[pin]).forEach(cmd => {
                        newCmd = values[pin][cmd]['val'];
                    })
                    cmds += newCmd;
                } else cmds += "2";
            })
            res.json({ data: cmds, status: true });
        })
    })
});



module.exports = router;