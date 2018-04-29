/**
 * WebApp entry point
 */

// Polyfill
import 'babel-polyfill';

// Libraries
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../redux/store';
// Routes
import pages from './pages';

const getAppDomElement = () => {
    const DOM_APP_EL_ID = 'app';
    let elm = document.getElementById(DOM_APP_EL_ID);
    if (elm) {
        return elm;
    }
    elm = document.createElement('div');
    elm.setAttribute('id', DOM_APP_EL_ID);
    document.body.appendChild(elm);
    return elm;
};

// Render the router
ReactDOM.render((
    <Provider store={store}>
        <Router>
            {pages}
        </Router>
    </Provider>
), getAppDomElement());

module.hot ? module.hot.accept() : false;