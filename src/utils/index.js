import {get} from "lodash";

export const isDevEnv = () => process && process.env.NODE_ENV !== 'production';
export const isProductionEnv = () => !isDevEnv();


export const logger = {

    info: (a) => {
        if (isDevEnv()) {
            console.log(a); // eslint-disable-line no-console
        }
        return a;
    },
    err: (a) => {
        console.log(a); // eslint-disable-line no-console
    },
    debug: (a) => {
        if (isDevEnv()) {
            console.debug(a); // eslint-disable-line no-console
        }
        return a;
    }


}
export const getImageNameWithoutVersion = (container = '') => {
    if (typeof container === 'string') {
        container = {Image: (container)}
    }
    return get(container, ['Labels', 'versions.image']) || container.Image.split(':')[0];
}