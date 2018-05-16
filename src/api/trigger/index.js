import request from 'superagent';
import config from '../../config';
// import noCache from 'superagent-no-cache';
const {DEPLOYMENT_TRIGGER_URI, DEPLOYMENT_TRIGGER_METHOD} = config;



export const triggerCi = async (body) => {
    const ciResponseBody = (
        await request[DEPLOYMENT_TRIGGER_METHOD](DEPLOYMENT_TRIGGER_URI)
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(body))
    ).body;
    console.log(ciResponseBody);
    return ciResponseBody;
};

