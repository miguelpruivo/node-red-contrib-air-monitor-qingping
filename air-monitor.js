
module.exports = function (RED) {
	function AirMonitorNode(config) {
		const miio = require('miio');
		RED.nodes.createNode(this, config);
		var node = this;

		if (config.ip && config.token) {
			discover(node, miio, config);
		}
	}

	RED.nodes.registerType("air-monitor", AirMonitorNode);
}



function discover(node, miio, config) {
	miio.device({
		address: config.ip,
		token: config.token,
	}).then(device => {
		node.log('Discovered Mi Clear Grass: ' + device.miioModel);

		if (device.miioModel == 'cgllc.airmonitor.s1') {
			node.status({ fill: "green", shape: "dot", text: "connected" });
			loadData(node, device, config);
		}
		else if (device.miioModel == 'cgllc.airm.cgd1st') {
			node.status({ fill: "green", shape: "dot", text: "connected" });
			loadDataByMapping(node, device, config);
		}
	}).catch(err => {
		node.error('Failed to discover Clear Glass with error ' + err);
		node.status({ fill: "red", shape: "ring", text: "disconnected" });
		setTimeout(function () {
			discover(node, miio, config);
		}, 30000);
	});
}


function loadData(node, device, config) {

	device.call("get_prop", ["co2", "pm25", "tvoc", "temperature", "humidity"]).then(result => {
		var co2 = result['co2'];
		var humidity = result['humidity'];
		var pm25 = result['pm25'];
		var tvoc = result['tvoc'];
		var temperature = result['temperature'];
		node.send({
			'payload': {
				...(config.co2 ? { 'co2': co2 } : {}),
				...(config.humidity ? { 'humidity': humidity } : {}),
				...(config.pm25 ? { 'pm25': pm25 } : {}),
				...(config.tvocs ? { 'tvoc': tvoc } : {}),
				...(config.temperature ? { 'temperature': temperature } : {}),
			}
		});
	}).catch(function (err) {
		node.error('Failed to get_prop: ' + err);
	});

	setTimeout(function () {
		loadData(node, device, config);
	}, config.refresh * 1000);
}

const _MAPPING = {
    "humidity": {"siid": 3, "piid": 1},
    "pm25": {"siid": 3, "piid": 4},
    "pm10": {"siid": 3, "piid": 5},
    "temperature": {"siid": 3, "piid": 7},
    "co2": {"siid": 3, "piid": 8},
    "battery": {"siid": 4, "piid": 1},
    "charging_state": {"siid": 4, "piid": 2},
    "voltage": {"siid": 4, "piid": 3},
    "start_time": {"siid": 9, "piid": 2},
    "end_time": {"siid": 9, "piid": 3},
    "monitoring_frequency": {"siid": 9, "piid": 4},
    "screen_off": {"siid": 9, "piid": 5 },
    "device_off": {"siid": 9, "piid": 6},
    "temperature_unit": {"siid": 9, "piid": 7},
}

function find_mapping_key(siid, piid) {
	for (var m in _MAPPING){
		if (_MAPPING[m]['siid'] == siid && _MAPPING[m]['piid'] == piid)
			return m
	}
}

function loadDataByMapping(node, device, config) {

	device.call("get_properties", Object.values(_MAPPING)).then(raw_result => {
		var result = {}
		for (var r in raw_result) {
		    result[find_mapping_key(raw_result[r]['siid'], raw_result[r]['piid'])] = raw_result[r]['value']
		}

		var co2 = result['co2'];
		var humidity = result['humidity'];
		var pm25 = result['pm25'];
		var tvoc = null;
		var temperature = result['temperature'];
		node.send({
			'payload': {
				...(config.co2 ? { 'co2': co2 } : {}),
				...(config.humidity ? { 'humidity': humidity } : {}),
				...(config.pm25 ? { 'pm25': pm25 } : {}),
				...(config.tvocs ? { 'tvoc': tvoc } : {}),
				...(config.temperature ? { 'temperature': temperature } : {}),
			}
		});
	}).catch(function (err) {
		node.error('Failed to get_prop: ' + err);
	});

	setTimeout(function () {
		loadDataByMapping(node, device, config);
	}, config.refresh * 1000);
}
