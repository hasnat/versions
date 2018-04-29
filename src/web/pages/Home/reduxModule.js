import {loop, Effects as Ef, liftState} from 'redux-loop';
import Immutable from 'seamless-immutable';
import { getGroups, getContainers, getImageTags } from '../../apiInterface'
import { Intent } from "@blueprintjs/core";
import { createReduxModule } from '../../../redux/reduxModuleComponent';
import messageToaster from '../../components/messageToaster';
import {getImageNameWithoutVersion, getImageAvailableTags} from './utils';
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
    errorImages: {}
});
const toastError = (error) => Ef.call(() => {
    messageToaster().show({
        intent: Intent.DANGER,
        message: error
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
                    const data = await getImageTags(payload);
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
