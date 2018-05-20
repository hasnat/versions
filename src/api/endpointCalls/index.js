import { find, cloneDeepWith } from 'lodash';

const omitDeep = (collection, excludeKeys) => cloneDeepWith(collection, (value) => {

    if (value && typeof value === 'object') {
        excludeKeys.forEach((key) => {
            delete value[key];
        });
    }
});

export const getAllGroups = () => {
    // TODO: Move omit 'all' to a config
    return omitDeep(require(__dirname + '/../../../endpoints.json'), ['', 'all']);
};

export const getEndpointInfo = (Name) => {
    const endpoints = require(__dirname + '/../../../endpoints.json');
    let endpoint = false;
    Object.keys(endpoints).map(group => {
        endpoint = endpoints[group][Name] ? endpoints[group][Name] : endpoint;
    });
    return endpoint;
};
