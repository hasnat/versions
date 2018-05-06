import {findKey} from 'lodash';
export const getImageAvailableTags = (images, imageNameRaw) => {
    const imageName = getImageNameWithoutVersion(imageNameRaw);
    return (images[imageName] || {}).tags || [];
};
export const isVersionLatest = (images, imageNameRaw, tag = false) => {
    tag = tag ? tag : getVersionFromImageName(imageNameRaw);
    const imageTags = getImageAvailableTags(images, imageNameRaw);
    if (tag === 'latest') {
        return true;
    }
    return imageTags[tag] && imageTags[tag] === imageTags['latest'];
};
export const getImageNameWithoutVersion = (imageNameRaw = '') => imageNameRaw.split(':')[0];
export const getVersionFromImageName = (imageNameRaw = '') => imageNameRaw.split(':')[1] || 'latest';

export const isLocalImageSameAsRegistry = (images, container) => {
    // debugger;
    const tag = getVersionFromImageName(container.Image);
    const image = images[getImageNameWithoutVersion(container.Image)] || {tags: {}};
    return image.tags[tag] === container.LocalImageDigest;
}
export const showActualImageFromRegistry = (images, container) => {
    const image = images[getImageNameWithoutVersion(container.Image)] || {tags: {}};

    const key = findKey(image.tags, o => o === container.LocalImageDigest);
    return key ? key : false;
}