const { spawnSync } = require( 'child_process' );
import spawnAsync from '@exponent/spawn-async';
import {logger} from "../../utils";
import {drop, last, take, find, head} from "lodash";
import config from '../../config'
import request from 'superagent';
// import noCache from 'superagent-no-cache';


const getDockerCurlArguments = ({
    URL = 'http://localhost',
    TLS = false,
    TLSSkipVerify = true,
    TLSCACert = 'ca.pem',
    TLSCert = 'cert.pem',
    TLSKey = 'key.pem'
} = {}, apiCall) => ([
    '--no-buffer',
    '-s',
    '-XGET',
    ...(URL === 'http://localhost' ? [
        '--unix-socket',
        '/var/run/docker.sock'
    ] : []),
    ...(TLS && TLSSkipVerify ? [
        '--insecure'
    ] : []),
    ...(TLS ? [
        '--cert', TLSCert,
        '--key', TLSKey,
        '--cacert', TLSCACert,
    ] : []),
    URL + apiCall
]);

export const getAllImagesInfoOnEndpoint = async (endpoint) => {

        const command = getDockerCurlArguments(endpoint, '/images/json?all=1');
        console.log('curl ' + command.join(' '));
        const resultPromise = spawnAsync('curl', command);
        let {
            pid,
            // output: [stdout, stderr],
            stdout,
            stderr,
            status,
            signal,
        } = await resultPromise;
        const containers = JSON.parse(stdout);
        return containers
            .filter(container => (new RegExp(config.INCLUDE_CONTAINERS_BY_IMAGES))
                .test(container.Image))
            .filter(container => config.EXCLUDE_CONTAINERS_BY_IMAGES !== '' && !(new RegExp(config.EXCLUDE_CONTAINERS_BY_IMAGES))
                .test(container.Image));

};

export const getAllContainers = async (endpoint) => {

        // todo: remove this hardcoded for local
        // todo: make error loggin more robust
        // endpoint = {};

        try {

            const allImagesInfo = await getAllImagesInfoOnEndpoint(endpoint);

            const command = getDockerCurlArguments(endpoint, '/containers/json?all=1');
            console.log('curl ' + command.join(' '));
            const resultPromise = spawnAsync('curl', command);
            let {
                pid,
                // output: [stdout, stderr],
                stdout,
                stderr,
                status,
                signal,
            } = await resultPromise;
            const containers = JSON.parse(stdout);
            let containersFiltered = containers
                .filter(container => (new RegExp(config.INCLUDE_CONTAINERS_BY_IMAGES))
                    .test(container.Image))
                .filter(container => config.EXCLUDE_CONTAINERS_BY_IMAGES !== '' && !(new RegExp(config.EXCLUDE_CONTAINERS_BY_IMAGES))
                    .test(container.Image));

            containersFiltered.map(container => {
                container.LocalImageDigest = (head(find(allImagesInfo, {Id: container.ImageID}).RepoDigests) || '').split('@')[1] || ''
                return container;
            });
            return containersFiltered;
        } catch (e) {
            console.log(e);
            // We're not sending error as it might contain sensitive data
            throw 'Error connecting to docker host';
        }

};
export const getRegistryURL = (registry) => {
    if (registry === config.DOCKER_HUB_REGISTRY) {
        return registry;
    }
    const configKey = registry.replace(/\./g, '_').toUpperCase();

    if (config[`REGISTRY_CONFIG_${configKey}`]) {
        return config[`REGISTRY_CONFIG_${configKey}`];
    }

    return registry;
};
export const getImageInfo = (imageRaw) => {

    let image = imageRaw.split(':')[0];
    const version = last(drop(imageRaw.split(':'))) || 'latest';
    const registry = /\./.test(image) ? imageRaw.split('/')[0] : config.DOCKER_HUB_REGISTRY;


    if (registry === config.DOCKER_HUB_REGISTRY) {
        image = /\//.test(image) ? image : `library/${image}`
    } else {
        image = drop(image.split('/')).join('/')
    }

    return {
        registry: getRegistryURL(registry),
        image,
        version
    }
};
const dockerHubImageAccessTokens = {};
export const getDockerHubImageTag = async (image, tag, retry = true) => {
    const token = dockerHubImageAccessTokens[image] ? dockerHubImageAccessTokens[image] : (await request
        .get(`https://auth.docker.io/token?service=registry.docker.io&scope=repository:${image}:pull`)
    ).body.token;

    dockerHubImageAccessTokens[image] = token;

    try {
        return await request
            .head(`https://index.docker.io/v2/${image}/manifests/${tag}`)
            .set('Accept', 'application/vnd.docker.distribution.manifest.v2+json')
            .set('Authorization', `Bearer ${token}`);
    } catch (e) {
        // think token has expired, lets try again
        if (retry) {
            dockerHubImageAccessTokens[image] = false;
            return await getDockerHubImageTag(image, tag, false);
        }
        throw e;
    }
};

export const getTagHash = async (image, tag, registry = config.DOCKER_HUB_REGISTRY) => {

    const response = registry === config.DOCKER_HUB_REGISTRY ?
        await getDockerHubImageTag(image, tag)
        :
        (
            await request
            .head(`${registry}/${image}/manifests/${tag}`)
            .set('Accept', 'application/vnd.docker.distribution.manifest.v2+json')
        );

    return response.headers['docker-content-digest'];
};

export const getTags = async (registry, image) => {
    let tags = [];
    if (registry === config.DOCKER_HUB_REGISTRY) {
        const response = await request.get(`${registry}/${image}/tags/?page_size=${config.MAX_TAGS}`);

        tags = response.body.results.map(tag => tag.name)
        console.log('tags', tags);
    } else {
        tags = (await request.get(`${registry}/${image}/tags/list`)).body.tags
    }

    return {image, tags};
};

export const getImageTags = async (imageRaw) => {
    console.log(imageRaw);
    const { registry, image } = getImageInfo(imageRaw);
    console.log(getImageInfo(imageRaw))
    console.log(`${registry}/v2/${image}/tags/list`)
    const response = await getTags(registry, image);
    response.tags = Object.assign({}, ...await Promise.all(
        response.tags.map(async tag => ({[tag]: await getTagHash(image, tag, registry)}))
    ));

    return response;
};