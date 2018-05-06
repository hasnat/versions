import request from 'superagent';
import config from '../../config';
import noCache from 'superagent-no-cache';
const {CLIENT_CONFIG: {API_HOST}} = config;



export const getGroups = async () => (await request.get(API_HOST + '/groups').use(noCache)).body;


export const getContainers = async (node) => (await request.get(API_HOST + '/containers/' + node).use(noCache)).body;



//const imageName = image.replace('/','').split(':')[0];
export const getImageTags = async (image) => (await request.get(API_HOST + '/image/' + image).use(noCache)).body;


export const triggerCiClient = async (body) => (await request.post(API_HOST + '/trigger').use(noCache).send(body));
