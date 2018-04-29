import { connectModule, createModule } from '@hasnat/redux-modules';
import { injectReducer } from '@hasnat/redux-injector';
import { compose } from 'recompose';
import Immutable from "seamless-immutable";
import {liftState} from "redux-loop";
import { logger } from '../utils';



export const createReduxModule = (name, initialState, transformations) => {
    const moduleBootstrap = {
        selector: state => Immutable.asMutable(state, {deep: true}), // mapStateToProps
        composes: [liftState],
        middleware: [
            a => {
                a.meta = a.meta || {};
                a.meta.thisReduxModule = thisReduxModule;
                return a;
            },
            logger.info
        ]
    };
    const thisReduxModule = createModule(Object.assign({}, moduleBootstrap, {name, initialState, transformations}));
    return thisReduxModule;
};

export default module => Component => {
    injectReducer(module.name, module.reducer);
    return compose(
        connectModule(module)
    )(Component)
};
