# node-red-contrib-air-monitor-qingping

<img src="https://ae01.alicdn.com/kf/HTB1XVLxavfsK1RjSszgq6yXzpXaZ/xiaomi-mijia-3-1-ips.jpg_q50.jpg" width="250" height="250">

## Instalation

### Node-Red air-monitor node that exposes multiple air quality metrics.
#### Supported metrics:
- PM2.5
- CO2
- TVOCs
- Temperature
- Humidity

## Configuration

Use the configuration dialog to set:
- IP Adress of the device (required)
- API Token of the device (required)
- Refresh rate (defaults to 5 seconds)

Optionally, all metrics could be enabled/disabled. All are enabled by default.

## Get the token & IP address
You can check [the following](https://github.com/Maxmudjon/com.xiaomi-miio/blob/master/docs/obtain_token.md) to get the device's information that you need in order to properly setup the node.

