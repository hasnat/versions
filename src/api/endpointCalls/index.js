import { find } from 'lodash';

export const getAllGroups = () => {
    return require(__dirname + '/../../../endpoints.json');
};

export const getEndpointInfo = (Name) => (
    find(require(__dirname + '/../../../endpoints.json'), {Name})
);
