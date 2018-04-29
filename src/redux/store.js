import thunkMiddleware from 'redux-thunk';
// import reducers from './reducers';
const reducers = {};
import { createInjectStore } from '@hasnat/redux-injector';
import { applyMiddleware, compose } from 'redux';
const reduxDevTools = typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__();
import { install, combineReducers } from 'redux-loop';
export default createInjectStore(
    reducers,
    reduxDevTools,
    compose(
        install(),
        applyMiddleware(thunkMiddleware)
    ),
    // applyMiddleware(thunkMiddleware),
    {
        combineReducers
        // createStore
    }
);
