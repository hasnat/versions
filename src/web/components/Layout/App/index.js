import React, {Component} from 'react';
// Base styling
import './reset.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import './base.css';
import './style.css';
import Header from '../Header';

export default ({children}) => (
    <div className="App">
        <Header/>
        <div className="App-body">
            {children}
        </div>
    </div>
)