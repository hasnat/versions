import {loop, Effects as Ef, liftState} from 'redux-loop';
import Immutable from 'seamless-immutable';
import { getGroups, getContainers, getImageTags, triggerCiClient } from '../../apiInterface'
import { Intent } from "@blueprintjs/core";
import { xor } from "lodash";
import { createReduxModule } from '../../../redux/reduxModuleComponent';
import messageToaster from '../../components/messageToaster';
import {getImageAvailableTags} from './utils';
import {getImageNameWithoutVersion} from '../../../utils';
import {CLIENT_CONFIG} from '../../../config'
export const reduxModuleName = 'NodesInfo';
export const initialState = Immutable({
    hi: 'hi',
    groups: {},
    loadingGroups: false,
    containers: {},
    loadingContainers: {},
    errorContainers: {},
    images: {},
    loadingImages: {},
    errorImages: {},
    deployTo: false,
    deploying: false,
    deployed: []
});
const toastError = (error) => Ef.call(() => {
    messageToaster().show({
        intent: Intent.DANGER,
        message: error
    });
    return Ef.none();
});

const toastSuccess = (message) => Ef.call(() => {
    messageToaster().show({
        intent: Intent.SUCCESS,
        message
    });
    return Ef.none();
});

export const transformations = {
    getGroups: (state, {payload, meta: {thisReduxModule}}) => loop(
        {
            ...state,
            loadingGroups: true
        },
        Ef.promise(async () => {
                try {
                    const groups = await getGroups();
                    return thisReduxModule.actions.loadedGroups(groups);
                } catch (e) {
                    // debugger;
                    return thisReduxModule.actions.errorGroups(e.message);
                }
            }
        )
    ),
    loadedGroups: (state, {payload}) => loop(
        {...state, loadingGroups: false, groups: payload},
        Ef.call(() => Ef.none())
    ),

    errorGroups: (state, {payload}) => loop(
        {...state, loadingGroups: false, errorGroups: payload},
        toastError(payload)
    ),


    loadContainers: (state, {payload, meta: {thisReduxModule}}) => loop(
        {
            ...state,
            loadingContainers: {...state.loadingContainers, ...{[payload]: true}}
        },
        Ef.promise(async () => {
                try {
                    const data = await getContainers(payload);
                    return thisReduxModule.actions.loadedContainer({container: payload, data})
                } catch (e) {
                    return thisReduxModule.actions.errorContainer({container: payload, error: e.message})
                }
            }
        )
    ),
    loadedContainer: (state, {payload: {container, data}}) => (
        {
            ...state,
            loadingContainers: {...state.loadingContainers, ...{[container]: false}},
            containers: {...state.containers, ...{[container]: data}}
        }
    ),
    errorContainer: (state, {payload: {container, error}}) => loop(
        {
            ...state,
            loadingContainers: {...state.loadingContainers, ...{[container]: false}},
            errorContainers: {...state.errorContainers, ...{[container]: error}}
        },
        toastError(error)
    ),


    loadImages: (state, {payload, meta: {thisReduxModule}, image = getImageNameWithoutVersion(payload)}) => loop(
        {
            ...state,
            loadingImages: {...state.loadingImages, ...{[image]: true}}
        },
        Ef.promise(async () => {
                try {
                    const data = await getImageTags(image);
                    return thisReduxModule.actions.loadedImage({image, data})
                } catch (e) {
                    return thisReduxModule.actions.errorImage({image, error: e.message})
                }
            }
        )
    ),
    loadedImage: (state, {payload: {image, data}}) => (
        {
            ...state,
            loadingImages: {...state.loadingImages, ...{[image]: false}},
            images: {...state.images, ...{[image]: data}}
        }
    ),
    errorImage: (state, {payload: {image, error}}) => loop(
        {
            ...state,
            loadingImages: {...state.loadingImages, ...{[image]: false}},
            errorImages: {...state.errorImages, ...{[image]: error}}
        },
        toastError(error)
    ),



    setDeployToParams: (state, {payload: {group, node, containerName, currentImage, newSelectedVersion}}) => (
        {
            ...state,
            deployTo: {group, node, containerName, currentImage, newSelectedVersion, selectedGroupNodes: [node]}
        }
    ),
    toggleDeployToNode: (state, {payload}) => (
        {
            ...state,
            deployTo: {...state.deployTo, selectedGroupNodes: xor(state.deployTo.selectedGroupNodes, [payload])}
        }
    ),
    deployToNodeSelection: (state, {payload}) => (
        {
            ...state,
            deployTo: {
                ...state.deployTo,
                selectedGroupNodes: payload === true ?
                    Object.keys(state.groups[state.deployTo.group]) : (payload === 'selected' ? [state.deployTo.node]: [])
            }
        }
    ),
    cancelDeployTo: (state) => (
        {
            ...state,
            deployTo: false
        }
    ),



    startDeploy: (state, {meta: {thisReduxModule}}) => loop(
        {
            ...state,
            deploying: state.deployTo
        },
        Ef.promise(async () => {
                try {
                    const data = await triggerCiClient(state.deployTo);
                    return thisReduxModule.actions.deployInitiated(data)
                } catch (e) {
                    return thisReduxModule.actions.deployError(e)
                }
            }
        )
    ),
    deployInitiated: (state, {payload}) => loop(
        {
            ...state,
            deployed: [state.deploying],
            deploying: false
        },
        (
            (
                () => {
                    try {
                    if (typeof CLIENT_CONFIG.DEPLOYMENT_TRIGGER_URI_LATEST_LOG !== 'undefined' && CLIENT_CONFIG.DEPLOYMENT_TRIGGER_URI_LATEST_LOG !== '') {
                    window.open(CLIENT_CONFIG.DEPLOYMENT_TRIGGER_URI_LATEST_LOG, '_blank').focus();
                    } } catch(e) {}
                }
            )(),
            toastSuccess('Deploy triggered')
        )
    ),
    deployError: (state, {payload}) => loop(
        {
            ...state,
            deploying: false
        },
        toastError(payload)
    ),



    test: (state, {payload, meta: {thisReduxModule}}) => loop(
        state,
        Ef.promise(() => Promise.resolve(thisReduxModule.actions.test2('arg_for_test2_from_test1')))
    ),
    test2: (state, {payload, meta: {thisReduxModule}}) => loop(
        state,
        Ef.promise(() => {
            console.log('TEST2');
            debugger;
            return Promise.resolve(thisReduxModule.actions.syncAction('asd'));
        })
    ),
    syncAction: (state,  {payload, meta: {thisReduxModule}}) => loop(
        {
            ...state,
            filesInAction: false
        },
        Ef.call(() => {
            console.log('okokok');
            debugger;
            messageToaster().show({
                intent: Intent.DANGER,
                message: 'Cannot update file state, please try again.'
            });
            return Ef.none();
        })
    )

};

export default createReduxModule(
    reduxModuleName,
    initialState,
    transformations
);
