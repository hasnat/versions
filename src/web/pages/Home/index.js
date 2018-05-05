import React from "react";
import {compose, lifecycle, withHandlers, withState} from "recompose";
import reduxModuleComponent from '../../../redux/reduxModuleComponent';
import reduxModule from './reduxModule';
import {flatten, head, findKey} from 'lodash';
import { Checkbox, Classes, Button, ButtonGroup, NonIdealState, Spinner, Tooltip, Position, Intent } from "@blueprintjs/core";
import { Tab, Tabs } from "@blueprintjs/core";
import {
    getVersionFromImageName,
    getImageNameWithoutVersion,
    isVersionLatest,
    getImageAvailableTags,
    isLocalImageSameAsRegistry, showActualImageFromRegistry
} from './utils';

import { ControlGroup, Navbar, NavbarGroup, NavbarHeading, NavbarDivider, Alignment } from "@blueprintjs/core";
import "./style.less";

const ContainersComponent = (
    {
        node,
        selectedNode, setSelectedNode, setSelectedNodeAndLoadContainers,
        [reduxModule.name]: {groups, containers, images, loadingImages, loadingContainers},
        actions: {test, loadContainers, loadImages}
    }
) => (
    <div className="pt-card">
        <h4>{node}
            <Button
                icon="refresh"
                className="pt-minimal"
                loading={loadingContainers[node]}
                onClick={() => loadContainers(node)}
            />
        </h4>

        {containers[node] && !containers[node].length && !loadingContainers[node] && (
            <NonIdealState
                description="No eligible containers found"
                title="Nothing to display"
                visual='info-sign'
                />
        )}
        {containers[node] && !!containers[node].length && (<table className="pt-html-table">
            <thead>
            <tr>
                <th>Container</th>
                <th>Image</th>
                <th>Current Version</th>
                <th>Available Versions</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {containers[node].map((container, i) => (<tr key={i}>
                <td>{head(container.Names)}</td>
                <td>{container.Image}</td>
                <td>
                    {container.Image.split(':')[1] || 'latest'} - {showActualImageFromRegistry(images, container)}
                    {/*{*/}
                        {/*isVersionLatest(images, container.Image, false) ? ' - latest' : ''*/}
                    {/*}*/}

                    <Tooltip
                        content={isLocalImageSameAsRegistry(images, container) ? 'Image is up-to date with registry' : 'Container image does not match as the same tag on registry, typically outdated version.'}
                        position={Position.TOP}
                    >
                        <Button
                            icon={isLocalImageSameAsRegistry(images, container) ? 'tick-circle' : 'warning-sign'}
                            intent={isLocalImageSameAsRegistry(images, container) ? Intent.SUCCESS : Intent.WARNING}
                            className="pt-minimal"
                            loading={loadingImages[getImageNameWithoutVersion(container.Image)]}
                            onClick={() => loadImages(container.Image)}
                        />
                    </Tooltip>
                </td>
                <td>

                        <ControlGroup>
                            <div className="pt-select pt-minimal">
                        <select>
                            {Object.keys(getImageAvailableTags(images, container.Image)).map((tag , i) => (
                                <option key={i} value={tag} selected={getVersionFromImageName(container.Image) === tag}>
                                    {tag}
                                    {/*{isVersionLatest(images, container.Image, tag) ? ' - latest' : ''}*/}

                                </option>
                            ))}
                        </select>
                            </div>
                        <Button
                            icon="refresh"
                            className="pt-minimal"
                            loading={loadingImages[getImageNameWithoutVersion(container.Image)]}
                            onClick={() => loadImages(container.Image)}
                        />
                        </ControlGroup>

                </td>
                <td>
                    <ButtonGroup>

                        <Button icon="outdated" or="updated" className="pt-minimal" />

                        <Button icon="add" className="pt-minimal" />
                    </ButtonGroup>
                </td>
            </tr>))}
            </tbody>
        </table>)}
    </div>
);
const Containers =  compose(
    reduxModuleComponent(reduxModule),
)(ContainersComponent);

const Home = (
    {
        selectedGroup, setSelectedGroup,
        selectedNode, setSelectedNode, setSelectedNodeAndLoadContainersIfRequired, loadAllNodesContainers,
        [reduxModule.name]: {groups, containers, images, loadingImages, loadingContainers},
        actions: {test, loadContainers, loadImages }
    }
) => (
    <div className="Home pt-card">
        <Tabs
            vertical={true}
            id="groupsTabs"
            onChange={f => setSelectedGroup(f)} selectedTabId={selectedGroup}
            >
            {Object.keys(groups)
                .map(group =>
                    (<Tab
                        className=""
                        id={group}
                        key={group}
                        title={group}
                        panel={(
                                <Tabs
                                    id={"nodesTab" + group}
                                    vertical={true}
                                    onChange={f => setSelectedNodeAndLoadContainersIfRequired(f)}
                                    selectedTabId={selectedNode}
                                >

                                    {Object.keys(groups[group])
                                        .map(node =>
                                            (<Tab
                                                id={node}
                                                key={node}
                                                title={
                                                    <ButtonGroup large={false} fill={true}>
                                                        <Button

                                                            icon={containers[node] && !!containers[node].length ? 'full-circle' : 'ring'}
                                                            // text={node}
                                                            className="pt-minimal"
                                                            loading={loadingContainers[node]}
                                                            onClick={() => loadContainers(node)}
                                                        />
                                                        <Button
                                                            rightIcon="chevron-right"

                                                            text={node}
                                                            className="pt-minimal pt-fill"
                                                            disabled={loadingContainers[node]}
                                                            // onClick={() => setSelectedNodeAndLoadContainersIfRequired(node)}
                                                        />
                                                    </ButtonGroup>
                                                }
                                                panel={(
                                                    <Containers node={node}/>
                                                )}
                                            />)
                                        )

                                    }
                                    <Button
                                        className="pt-minimal pt-fill"
                                        disabled={!Object.keys(groups[group]).length}
                                        text="Load All"
                                        onClick={() => loadAllNodesContainers(group)}
                                    />

                                </Tabs>

                        )}
                    />)
                )}
        </Tabs>


    </div>
);
export default compose(
    withState('selectedGroup', 'setSelectedGroup', false),
    withState('selectedNode', 'setSelectedNode', false),
    reduxModuleComponent(reduxModule),
    withHandlers({
        setSelectedNodeAndLoadContainersIfRequired: ({setSelectedNode, [reduxModule.name]: {containers}, actions: {loadContainers}}) => (node) => {
            containers[node] ? false : loadContainers(node);
            setSelectedNode(node);
        },
        loadAllNodesContainers: ({[reduxModule.name]: {groups, containers}, actions: {loadContainers}}) => (group) => {
            Object.keys(groups[group]).map(node => containers[node] ? false : loadContainers(node))
        }
    }),
    lifecycle({
        componentDidMount() {
            // ;

            this.props.actions.getGroups()
            // debugger;
        }
    }),
)(Home);