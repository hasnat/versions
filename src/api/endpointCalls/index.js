import { find, cloneDeepWith } from 'lodash';

const omitDeep = (collection, excludeKeys) => cloneDeepWith(collection, (value) => {

    if (value && typeof value === 'object') {
        excludeKeys.forEach((key) => {
            delete value[key];
        });
    }
});

export const getAllGroups = () => {
    return omitDeep(require(__dirname + '/../../../endpoints.json'), ['']);
};

export const getEndpointInfo = (Name) => (
    find(require(__dirname + '/../../../endpoints.json'), {Name})
);
