import React from "react";
import {compose, lifecycle, withHandlers, withState} from "recompose";
import reduxModuleComponent from '../../../redux/reduxModuleComponent';
import reduxModule from './reduxModule';
import {flatten, head, findKey, without} from 'lodash';
import {
    Checkbox,
    Classes,
    Button,
    ButtonGroup,
    NonIdealState,
    Spinner,
    Tooltip,
    Position,
    Intent,
    Dialog,
    Label
} from "@blueprintjs/core";
import {Tab, Tabs} from "@blueprintjs/core";
import classNames from 'classnames';
import {
    getImageVersionFromContainer,
    // isVersionLatest,
    getImageAvailableTags,
    isLocalImageSameAsRegistry, showActualImageFromRegistry
} from './utils';
import {getImageNameWithoutVersion} from "../../../utils";
import config from '../../../config';

import {ControlGroup, Navbar, NavbarGroup, NavbarHeading, NavbarDivider, Alignment} from "@blueprintjs/core";
import "./style.less";

const ContainersComponent = (
    {
        node, group,
        selectedNode, setSelectedNode, setSelectedNodeAndLoadContainers,
        setSelectedImageVersion,
        deployDialogState, closeDialog,
        deploy, currentDeploymentParams, toggleNodeInDeployment,
        [reduxModule.name]: {groups, containers, images, loadingImages, loadingContainers, deployTo, deploying},
        actions: {test, loadContainers, loadImages, showDeployDialog, deployToNodeSelection, toggleDeployToNode, cancelDeployTo, startDeploy}
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
                <th>Live</th>
                <th>Equivalent</th>
                <th>Available</th>
                {/*<th>Actions</th>*/}
            </tr>
            </thead>
            <tbody>
            {containers[node].map((container, i) => (<tr key={i}>
                <td>{head(container.Names)}</td>
                <td>{getImageNameWithoutVersion(container)}</td>
                <td>{getImageVersionFromContainer(container)}</td>
                <td>{showActualImageFromRegistry(images, container)}
                    <Tooltip
                        content={
                            isLocalImageSameAsRegistry(images, container) ?
                                'Image is up-to date with registry'
                                :
                                'Container image does not match as the same tag on registry, typically outdated version.'
                        }
                        position={Position.TOP}
                    >
                        <Button
                            icon={isLocalImageSameAsRegistry(images, container) ? 'tick-circle' : 'warning-sign'}
                            intent={isLocalImageSameAsRegistry(images, container) ? Intent.SUCCESS : Intent.WARNING}
                            className="pt-minimal"
                            loading={loadingImages[getImageNameWithoutVersion(container)]}
                            onClick={() => loadImages(container)}
                        />
                    </Tooltip>
                </td>
                <td>

                    <ControlGroup>
                        <div className="pt-select pt-minimal">
                            <select
                                value=""
                                onChange={(e) => setSelectedImageVersion(group, node, head(container.Names), container.Image, e.target.value)}
                            >
                                <option value="-">🚀</option>
                                {Object.keys(getImageAvailableTags(images, container)).map((tag, i) => (
                                    <option key={i} value={tag}>
                                        {tag}
                                        {getImageVersionFromContainer(container) === tag ? '*' : false}
                                        {/*{isVersionLatest(images, container.Image, tag) ? ' - latest' : ''}*/}

                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button
                            icon="refresh"
                            className="pt-minimal"
                            loading={loadingImages[getImageNameWithoutVersion(container)]}
                            onClick={() => loadImages(container)}
                        />
                    </ControlGroup>

                </td>
                {/*<td>*/}
                    {/*<ButtonGroup>*/}

                        {/*<Button icon="play" or="updated" className="pt-minimal"*/}
                                {/*onClick={*/}
                                    {/*// () => showDeployWindow(group, container.Image, version)*/}
                                    {/*() => setDeployDialogState(true)*/}
                                {/*}/>*/}

                    {/*</ButtonGroup>*/}
                {/*</td>*/}
            </tr>))}
            </tbody>
        </table>)}
        <Dialog
            icon="play"
            isOpen={deployDialogState}
            onClose={closeDialog}
            title="Deploy"
        >
            <div className="pt-dialog-body">
                <h5>{getImageNameWithoutVersion(deployTo.currentImage)}:{deployTo.newSelectedVersion}</h5>
                <ButtonGroup large={false}>
                    <Button icon="property" onClick={() => deployToNodeSelection('selected')}>Selected Node</Button>
                    <Button icon="properties" onClick={() => deployToNodeSelection(true)}>Select All</Button>
                    <Button icon="exclude-row" onClick={() => deployToNodeSelection(false)}>Select None</Button>
                </ButtonGroup>
                <div className="deploy-nodes-container">
                    {Object.keys(groups[group]).map(node =>
                        <Checkbox
                            key={node}
                            checked={
                                ((deployTo.selectedGroupNodes || []).indexOf(node) > -1)
                            }
                            label={node}
                            onChange={() => toggleDeployToNode(node)}
                        />
                    )}
                </div>
            </div>
            <div className="pt-dialog-footer">
                <div className="pt-dialog-footer-actions">
                    <Button
                        text="Cancel"
                        onClick={closeDialog}
                    />
                    <Button
                        intent={Intent.PRIMARY}
                        onClick={startDeploy}
                        loading={deploying}
                        text="Deploy"
                    />
                </div>
            </div>
        </Dialog>
    </div>
);
const Containers = compose(
    withState('deployDialogState', 'setDeployDialogState', false),

    reduxModuleComponent(reduxModule),
    withHandlers({
        setSelectedImageVersion: (
            {
                setDeployDialogState, setCurrentDeploymentParams, [reduxModule.name]: {groups},
                actions: {test, loadContainers, loadImages, setDeployToParams, toggleDeployToNode, cancelDeployTo}
            }
        ) => (group, node, containerName, currentImage, newSelectedVersion) => {

            setDeployToParams({group, node, containerName, currentImage, newSelectedVersion});
            setDeployDialogState(true);

            // debugger;
        },
        closeDialog: (
            {
                setDeployDialogState, setCurrentDeploymentParams, [reduxModule.name]: {groups},
                actions: {test, loadContainers, loadImages, showDeployDialog, toggleDeployToNode, cancelDeployTo}
            }
        ) => () => {
            cancelDeployTo();
            setDeployDialogState(false);
        }
    })
)(ContainersComponent);

const Home = (
    {
        selectedGroup, setSelectedGroup,
        selectedNode, setSelectedNode, setSelectedNodeAndLoadContainersIfRequired, loadAllNodesContainers,
        [reduxModule.name]: {groups, containers, images, loadingImages, loadingContainers},
        actions: {test, loadContainers, loadImages}
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
                                                <Containers node={node} group={group}/>
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