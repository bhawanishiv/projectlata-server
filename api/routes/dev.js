const admin = require('firebase-admin');
const db = admin.database();
const devCheck = require('../middleware/dev');
const router = require('express').Router();

/**
 * Checking instance with provided instanceId in body
 */
router.post('/', devCheck, (req, res, next) => {
    const { reqType } = req.body;
    if (!reqType) return res.status(404).send('error:no-req');
    switch (reqType) {
        case 'get-defs':
            let defs = '{D';
            getCPU(req, res, next, () => {
                getPinDefinitions(req, res, next, () => {
                    let sortedConfiguration = req.pin_configuration.sort((a, b) => a['pinNo'] - a['pinNo']);
                    sortedConfiguration.forEach(config => {
                        let result = req.definitions.find(def => def.pinNo == config.pinNo);
                        if (result) {
                            const { pinMode } = result;
                            if (pinMode == "input") defs += '1';
                            else if (pinMode == "output") defs += '0';
                        } else defs += '2';
                    });
                    res.send(`${defs}}`);
                })
            })
            break;

        case 'get-cmds':
            let cmds = '{C';
            getCPU(req, res, next, () => {
                getPinDefinitions(req, res, next, () => {
                    getCommands(req, res, next, () => {
                        let sortedConfiguration = req.pin_configuration.sort((a, b) => a['pinNo'] - a['pinNo']);
                        let commands = req.commands;
                        sortedConfiguration.forEach(config => {
                            let pin = Object.keys(commands).find(pin => pin == config.pinNo);
                            if (pin) {
                                let newCmd = 0;
                                Object.keys(commands[pin]).forEach(cmd => newCmd = commands[pin][cmd]['val'])
                                cmds += newCmd;
                            } else cmds += '2';
                        })
                        res.send(`${cmds}}`);
                    })
                })
            });
            break;

        case 'set-readings':
            let done = false;
            const { values } = req.body;
            if (!values) return res.status(404).send('error:no-values-found');
            const { instance } = req;
            if (!instance) return res.status(404).send('error:no-instance');
            const { key } = instance;
            if (!key) return res.status(404).send('error:no-instanceId');
            let time = new Date().toISOString();
            values.forEach(reading => {
                let { pinNo } = reading;
                if (!pinNo) return;
                let { value } = reading;
                if (!value) return;
                db.ref(`pinDefinitions/${key}`).orderByChild('pinNo').equalTo(pinNo).once('value', (snapshot) => {
                    if (!snapshot.val()) return;
                    db.ref(`readings/${key}/${pinNo}`).push({ reading: value, time: time }).then(success => {
                        done = true;
                    }).catch(error => done = false);
                });
            });
            res.status(404).send(done ? 'sucess:done' : 'error:unknown');
            break;
    }
});

function getCPU(req, res, next, callBack) {
    const { instance } = req;
    if (!instance) return res.status(404).send('error:no-instance');
    const { cpuId } = req.instance.val();
    if (!cpuId) return res.status(404).send('error:no-cpuId');
    db.ref(`cpus/${cpuId}`).once('value', (snapshot) => {
        const cpu = snapshot.val();
        if (!cpu) return res.status(404).send('error:no-cpu');
        req.cpu = cpu;
        callBack();
    })
}

function getPinDefinitions(req, res, next, callBack) {
    const { instance } = req;
    if (!instance) return res.status(404).send('error:no-instance');
    const { key } = instance;
    if (!key) return res.status(404).send('error:no-instanceId');
    const { cpu } = req;
    if (!cpu) return res.status(404).send('error:no-cpu');
    const { description } = cpu;
    if (!description) return res.status(404).send('error:no-cpu-description');
    const { pin_configuration } = description;
    if (!pin_configuration) return res.status(404).send('error:no-pin-configuration');
    req.pin_configuration = pin_configuration;
    db.ref(`pinDefinitions/${key}`).once('value', (snapshot) => {
        if (!snapshot.val()) return res.status(404).send('error:no-pin-definitions');
        req.definitions = snapshot.val();
        callBack();
    });
}

function getCommands(req, res, next, callBack) {
    const { instance } = req;
    if (!instance) return res.status(404).send('error:no-instance');
    const { key } = instance;
    if (!key) return res.status(404).send('error:no-instanceId');
    db.ref(`commands/${key}`).once('value', (snapshot) => {
        if (!snapshot.val()) return res.status(404).send('error:no-cmd-found');
        req.commands = snapshot.val();
        callBack();
    })
}


module.exports = router;