import {findKey, get} from 'lodash';
import {getImageNameWithoutVersion} from '../../../utils'
export const getImageAvailableTags = (images, container) => {
    const imageName = get(container, ['Labels', 'versions.image']) || getImageNameWithoutVersion(container);
    return (images[imageName] || {}).tags || [];
};
// export const isVersionLatest = (images, container, tag = false) => {
//     tag = tag ? tag : getImageVersionFromContainer(container);
//     const imageTags = getImageAvailableTags(images, imageNameRaw);
//     if (tag === 'latest') {
//         return true;
//     }
//     return imageTags[tag] && imageTags[tag] === imageTags['latest'];
// };

export const getImageVersionFromContainer = (container) => {
    return get(container, ['Labels', 'versions.version']) || container.Image.split(':')[1] || 'latest'
};

export const isLocalImageSameAsRegistry = (images, container) => {
    const tag = getImageVersionFromContainer(container);
    const image = images[getImageNameWithoutVersion(container)] || {tags: {}};
    return image.tags[tag] === container.LocalImageDigest;
};
export const showActualImageFromRegistry = (images, container) => {
    const image = images[getImageNameWithoutVersion(container)] || {tags: {}};

    const key = findKey(image.tags, o => o === container.LocalImageDigest);
    return key ? key : false;
};