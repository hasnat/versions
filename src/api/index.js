/**
 * Api entry point
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import config from '../config';
import {getAllGroups, getEndpointInfo} from './endpointCalls';
import {getAllContainers, getImageTags} from './dockerCalls';
import {triggerCi} from './trigger';

process.on('unhandledRejection', r => console.log('unhandledRejection', r.message));

const app = express();
app.use(helmet());
app.use(cors());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    //intercepts OPTIONS method
    'OPTIONS' === req.method ? res.send(200) : next();
});

const repondOrError = async (method, res, req) => {
    try {
        res.json(await method());
    } catch (e) {
        console.log('Express-ERROR', req.baseUrl, e.message);
        res.status(e.status || 500).send(e.message)
    }
};

app.use(express.static('dist'));

app.get('/client-config.js', (req, res) => {
    res.set('Content-Type', 'text/javascript');
    res.send(`
window.CLIENT_CONFIG = ${JSON.stringify(config.CLIENT_CONFIG)}
    `);

});

app.get('/groups', (req, res) => res.json(getAllGroups()));

app.get('/containers/:endpoint', (req, res) =>
    repondOrError(() => getAllContainers(getEndpointInfo(req.params.endpoint)), res, req)
);
app.post('/trigger', (req, res) =>
    repondOrError(() => triggerCi(req.body), res, req)
);

app.get('/image/:namespace?/:image', (req, res) =>
    repondOrError(() => getImageTags(req.params.namespace ? `${req.params.namespace}/${req.params.image}` : req.params.image), res, req)

);

app.listen(config.HTTP_PORT, () => console.log(`App listening on port ${config.HTTP_PORT}!`));