import { find, cloneDeepWith } from 'lodash';
import {IGNORE_HOST_GROUPS} from '../../config'
const omitDeep = (collection, excludeKeys) => cloneDeepWith(collection, (value) => {

    if (value && typeof value === 'object') {
        excludeKeys.forEach((key) => {
            delete value[key];
        });
    }
});

export const getAllGroups = () => {
    return omitDeep(require(__dirname + '/../../../endpoints.json'), (IGNORE_HOST_GROUPS || '').split(','));
};

export const getEndpointInfo = (Name) => {
    const endpoints = require(__dirname + '/../../../endpoints.json');
    let endpoint = false;
    Object.keys(endpoints).map(group => {
        endpoint = endpoints[group][Name] ? endpoints[group][Name] : endpoint;
    });
    return endpoint;
};
