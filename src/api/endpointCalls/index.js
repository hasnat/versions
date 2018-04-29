import { find } from 'lodash';

export const getAllGroups = () => {
    let endpoints = require(__dirname + '/../../../endpoints.json');

    const groups = {};
    endpoints.map(endpoint => {
        if (typeof endpoint.Name === 'undefined') {
            return;
        }
        const groupName = endpoint.Name.replace(/-?\d+/, '');
        if (typeof groups[groupName] === 'undefined') {
            groups[groupName] = {};
        }
        groups[groupName][endpoint.Name] = endpoint;
    });
    return groups;
};

export const getEndpointInfo = (Name) => (
    find(require(__dirname + '/../../../endpoints.json'), {Name})
);
