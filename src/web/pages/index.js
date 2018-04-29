import React from 'react';
import App from '../components/Layout/App';
import History from './History';
import Home from './Home';

import { HashRouter as Router, Route, Link } from "react-router-dom";

export default (

        <App>
            <Route path="/" component={Home} exact={true}/>
            <Route path="/history" component={History}/>
        </App>


);
