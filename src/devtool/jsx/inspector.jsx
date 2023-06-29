/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DEVICE, OBJECT_NAME } from '../js/constants';

import { EmulatorSettings } from '../js/emulatorStates';
import React from 'react';
import { changeRoomDimension } from '../js/messenger';

export default function Inspector({ device }) {
	const sceneContainerRef = React.useRef();
	const [showTransforms, setShowTransforms] = React.useState(true);
	const [showRoomSettings, setShowRoomSettings] = React.useState(false);
	const transformData = {};
	Object.values(DEVICE).forEach((deviceKey) => {
		const deviceName = OBJECT_NAME[deviceKey];
		transformData[deviceName] = React.useState({
			position: [0, 0, 0],
			rotation: [0, 0, 0],
		});
	});

	function fixNumber(rawValue) {
		const value = Number(rawValue);
		return (value >= 0 ? '\xa0' : '') + value.toFixed(2);
	}

	React.useEffect(() => {
		sceneContainerRef.current.appendChild(device.canvas);
		device.on('pose', (event) => {
			const { deviceKey, position, rotation } = event;
			const deviceName = OBJECT_NAME[deviceKey];
			const transform = transformData[deviceName];
			const setTransform = transform[1];
			setTransform({ position, rotation });
		});
		device.forceEmitPose();
	}, []);
	return (
		<>
			<div ref={sceneContainerRef} id="scene-container"></div>
			<div id="transform-component">
				<button
					onClick={() => {
						setShowTransforms(!showTransforms);
						setShowRoomSettings(false);
					}}
					className={showTransforms ? 'active' : ''}
				>
					device
				</button>
				<button
					onClick={() => {
						setShowRoomSettings(!showRoomSettings);
						setShowTransforms(false);
					}}
					className={showRoomSettings ? 'active' : ''}
				>
					room
				</button>
				{showTransforms &&
					Object.values(DEVICE).map((deviceKey) => {
						const deviceName = OBJECT_NAME[deviceKey];
						return (
							<div key={deviceKey} className="row transform-card">
								<div className="col-2 transform-icon d-flex justify-content-center align-items-center">
									<img
										src={'./assets/images/' + deviceName + '.png'}
										className="control-icon"
									/>
								</div>
								<div className="col-10 transform-body">
									<div className="row">
										<div className="value">
											<span>
												{fixNumber(transformData[deviceName][0].position[0])}
											</span>
											&nbsp;
											<span>
												{fixNumber(transformData[deviceName][0].position[1])}
											</span>
											&nbsp;
											<span>
												{fixNumber(transformData[deviceName][0].position[2])}
											</span>
										</div>
									</div>
									<div className="row">
										<div className="value">
											<span>
												{fixNumber(transformData[deviceName][0].rotation[0])}
											</span>
											&nbsp;
											<span>
												{fixNumber(transformData[deviceName][0].rotation[1])}
											</span>
											&nbsp;
											<span>
												{fixNumber(transformData[deviceName][0].rotation[2])}
											</span>
										</div>
									</div>
								</div>
							</div>
						);
					})}{' '}
				{showRoomSettings && (
					<div className="row transform-card" id="room-dimension-settings">
						<div className="col-2 transform-icon d-flex justify-content-center align-items-center">
							<img
								src="./assets/images/roomscale.png"
								className="control-icon"
							/>
						</div>
						<div className="col-10 transform-body">
							{[
								['x', 'width'],
								['y', 'height'],
								['z', 'depth'],
							].map(([key, name]) => (
								<div key={name + key} className="row">
									<span>Space {name}:</span>
									<input
										type="number"
										defaultValue={EmulatorSettings.instance.roomDimension[key]}
										onChange={(event) => {
											EmulatorSettings.instance.roomDimension[key] = parseFloat(
												event.target.value,
											);
											EmulatorSettings.instance.write();
											device.updateRoom();
											changeRoomDimension();
										}}
									/>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</>
	);
}