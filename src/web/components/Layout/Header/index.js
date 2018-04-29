import React from 'react';
import {Link} from 'react-router-dom';
import config from '../../../../config'
import './style.css';

const {HEADER_LOGO_URL} = config.CLIENT_CONFIG;

export default () => (
    <header className="Header">
        <nav className="pt-navbar .modifier">
            <div className="pt-navbar-group pt-align-left">
                <div className="pt-navbar-heading"><Link to={'/'}><img src={HEADER_LOGO_URL} height="40"/></Link>
                </div>
                <input className="pt-input" placeholder="Search..." type="text"/>
            </div>
            <div className="pt-navbar-group pt-align-right">
                <Link className="pt-button pt-minimal pt-icon-home" to={'/'}>Home</Link>
                <Link to={'/history'} className="pt-button pt-minimal pt-icon-history">History</Link>
                <span className="pt-navbar-divider"></span>
                <button className="pt-button pt-minimal pt-icon-user"></button>
                {/*<button className="pt-button pt-minimal  pt-icon-moon"></button>*/}
                {/*<button className="pt-button pt-minimal  pt-icon-flash"></button>*/}
                <button className="pt-button pt-minimal pt-icon-cog"></button>
            </div>
        </nav>
    </header>
)