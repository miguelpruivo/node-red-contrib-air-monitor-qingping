
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
			loadData(node, device, config);
		}
	}).catch(err => {
		node.error('Failed to discover Clear Glass with error ' + err);
		setTimeout(function () {
			discover(node, miio);
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
		node.error('Failed to get_prop  %s', err);
	});

	setTimeout(function () {
		loadData(node, device, config);
	}, config.refresh * 1000);
}



