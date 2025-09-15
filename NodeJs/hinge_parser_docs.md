# Hinge Device Parser Utility

A Node.js utility library for parsing TCP data packets from Hinge555Device and Hinge572Device IoT devices. This library converts hexadecimal data strings into structured JSON objects containing device telemetry and configuration information.

## Table of Contents

- [Installation](#installation)
- [Classes Overview](#classes-overview)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Data Formats](#data-formats)
- [Error Handling](#error-handling)

## Installation

```javascript
const { Utility, Hinge555Device, Hinge572Device } = require('./hinge-parser');
```

## Classes Overview

### Utility
Helper class containing IEEE754 floating-point conversion utilities.

### Hinge555Device
Parser for Hinge555Device device data packets, handling sensor readings with optional GPS coordinates.

### Hinge572Device
Parser for Hinge572Device device data packets, handling liquid level monitoring with configuration support.

## API Reference

### Utility.IEEE754_Hex_To_Float(hexString)

Converts a hexadecimal string to an IEEE754 floating-point number.

**Parameters:**
- `hexString` (string): 8-character hexadecimal string representing a 32-bit float

**Returns:**
- `number`: The converted floating-point value

### Hinge555Device.parseData(reqData)

Parses Hinge555Device device TCP data packets.

**Parameters:**
- `reqData` (string): Hexadecimal data string in uppercase format

**Returns:**
- `Object`: Contains `attrResult` (JSON string) and `tokenId` (string)

**Supported Data Types:**
- **Type 01/02 (30 bytes)**: Heartbeat/alarm without GPS
- **Type 01/02 (>30 bytes)**: Event packet with GPS coordinates

### Hinge572Device.parseData(reqData)

Parses Hinge572Device device TCP data packets.

**Parameters:**
- `reqData` (string): Hexadecimal data string in uppercase format

**Returns:**
- `Object`: Contains `attrResult` (JSON string) and `tokenId` (string)

**Supported Data Types:**
- **Type 01/02 (33 bytes)**: Heartbeat/alarm without GPS
- **Type 01/02 (41 bytes)**: Event packet with GPS coordinates
- **Other types (≥32 bytes)**: Configuration data

## Usage Examples

### Basic Hinge555Device Usage

```javascript
const { Hinge555Device } = require('./hinge-parser');

// Example 1: Heartbeat packet without GPS
const heartbeatData = "800001011E0692001A00000000016E008027C40001186962703655111781";
const result1 = Hinge555Device.parseData(heartbeatData);

console.log("Token ID:", result1.tokenId);
console.log("Parsed Data:", JSON.parse(result1.attrResult));

// Output:
// Token ID: "186962703655111"
// Parsed Data: {
//   height: 1682,
//   temperature: 26,
//   full_alarm: 0,
//   fire_alarm: 0,
//   tilt_alarm: 0,
//   battery_alarm: 0,
//   volt: 36.2,
//   angle: 0,
//   rsrp: -110,
//   frame_counter: 4457
// }

// Example 2: Event packet with GPS
const gpsData = "80000103410604180A1E4B1E1460047427709661000200003132302E39322E38392E3132323B23823B3135392E3138382E342E363B22B83B000000000000000081";
const result2 = Hinge555Device.parseData(gpsData);

console.log("Parsed GPS Data:", JSON.parse(result2.attrResult));

// Output includes longitude, latitude, and other sensor data
```

### Basic Hinge572Device Usage

```javascript
const { Hinge572Device } = require('./hinge-parser');

// Example 1: Heartbeat without GPS (spaces removed for actual usage)
const heartbeatData = "80007101211D7501CB0000001900000166000039C4000218632510742828585";
const result1 = Hinge572Device.parseData(heartbeatData);

console.log("Liquid Level Data:", JSON.parse(result1.attrResult));

// Output:
// {
//   liquidLevel: 7541,
//   airHeight: 459,
//   gpsEnabled: 0,
//   temperature: 25,
//   humidity: 0,
//   levelAlarm: 0,
//   temperatureAlarm: 0,
//   batteryAlarm: 0,
//   volt: 36.2,
//   rsrp: -110,
//   frameCounter: 4457
// }

// Example 2: Configuration data
const configData = "80007101291D7501CB01CD03E942EF272042000019000000166000039C4000218632510742828585";
const result2 = Hinge572Device.parseData(configData);

console.log("Config Data:", JSON.parse(result2.attrResult));
```

### Error Handling Example

```javascript
const { Hinge555Device, Hinge572Device } = require('./hinge-parser');

function parseDeviceData(deviceType, data) {
    try {
        let result;
        
        if (deviceType === 'Hinge555Device') {
            result = Hinge555Device.parseData(data);
        } else if (deviceType === 'Hinge572Device') {
            result = Hinge572Device.parseData(data);
        } else {
            throw new Error('Unknown device type');
        }

        if (!result.attrResult || result.attrResult === '""') {
            console.warn('No valid data parsed');
            return null;
        }

        return {
            tokenId: result.tokenId,
            data: JSON.parse(result.attrResult),
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Parsing error:', error.message);
        return null;
    }
}

// Usage
const parsedData = parseDeviceData('Hinge555Device', 'your-hex-data-here');
if (parsedData) {
    console.log('Successfully parsed:', parsedData);
}
```

### Real-time Data Processing

```javascript
const { Hinge555Device, Hinge572Device } = require('./hinge-parser');

class DeviceDataProcessor {
    constructor() {
        this.devices = new Map();
    }

    processPacket(rawData, deviceType = 'auto') {
        // Auto-detect device type if not specified
        if (deviceType === 'auto') {
            deviceType = this.detectDeviceType(rawData);
        }

        const parser = deviceType === 'Hinge555Device' ? Hinge555Device : Hinge572Device;
        const result = parser.parseData ? 
            parser.parseData(rawData) : 
            parser.parseData(rawData);

        if (result.tokenId && result.attrResult !== '""') {
            const deviceData = {
                tokenId: result.tokenId,
                attributes: JSON.parse(result.attrResult),
                lastSeen: new Date(),
                deviceType: deviceType
            };

            this.devices.set(result.tokenId, deviceData);
            this.handleDeviceUpdate(deviceData);
            
            return deviceData;
        }

        return null;
    }

    detectDeviceType(data) {
        // Simple heuristic based on data length patterns
        const length = data.length / 2;
        if (length === 30 || (length > 30 && length < 50)) {
            return 'Hinge555Device';
        }
        return 'Hinge572Device';
    }

    handleDeviceUpdate(deviceData) {
        console.log(`Device ${deviceData.tokenId} updated:`, deviceData.attributes);
        
        // Check for alarms
        if (deviceData.attributes.battery_alarm || deviceData.attributes.batteryAlarm) {
            console.warn(`BATTERY ALARM: Device ${deviceData.tokenId}`);
        }
        
        if (deviceData.attributes.fire_alarm) {
            console.error(`FIRE ALARM: Device ${deviceData.tokenId}`);
        }
    }

    getDeviceStatus(tokenId) {
        return this.devices.get(tokenId);
    }

    getAllDevices() {
        return Array.from(this.devices.values());
    }
}

// Usage
const processor = new DeviceDataProcessor();
const data = "800001011E0692001A00000000016E008027C40001186962703655111781";
const result = processor.processPacket(data, 'Hinge555Device');
```

## Data Formats

### Hinge555Device Attributes (without GPS)
```json
{
  "height": 1682,
  "temperature": 26,
  "full_alarm": 0,
  "fire_alarm": 0,
  "tilt_alarm": 0,
  "battery_alarm": 0,
  "volt": 36.2,
  "angle": 0,
  "rsrp": -110,
  "frame_counter": 4457
}
```

### Hinge555Device Attributes (with GPS)
```json
{
  "height": 1682,
  "longitude": "120.923456",
  "latitude": "31.234567",
  "temperature": 26,
  "full_alarm": 0,
  "fire_alarm": 0,
  "tilt_alarm": 0,
  "battery_alarm": 0,
  "volt": 36.2,
  "angle": 0,
  "rsrp": -110,
  "frame_counter": 4457
}
```

### Hinge572Device Attributes (Sensor Data)
```json
{
  "liquidLevel": 7541,
  "airHeight": 459,
  "gpsEnabled": 0,
  "temperature": 25,
  "humidity": 0,
  "levelAlarm": 0,
  "temperatureAlarm": 0,
  "batteryAlarm": 0,
  "volt": 36.2,
  "rsrp": -110,
  "frameCounter": 4457
}
```

### Hinge572Device Configuration Data
```json
{
  "firmwareVersion": "1.2",
  "uploadInterval": 30,
  "detectInterval": 60,
  "heightThreshold": 100,
  "TemperatureThreshold": 50,
  "BatteryThreshold": 20,
  "SuddentDropAlarmSwitch": 1,
  "SuddentDropAlarmThreshold": 500,
  "workMode": 1
}
```

## Error Handling

The parsers include built-in error handling:

- Returns empty `attrResult` and `tokenId` for invalid data
- Catches and logs parsing exceptions
- Validates data length against expected packet sizes
- Gracefully handles malformed hexadecimal strings

```javascript
// Example of checking for parsing errors
const result = Hinge555Device.parseData(someData);
if (!result.attrResult || result.attrResult === '""') {
    console.log('Failed to parse data or no valid data found');
} else {
    const parsedData = JSON.parse(result.attrResult);
    // Process valid data
}
```

## Notes

- All input hex strings should be in uppercase format
- GPS coordinates are formatted to 6 decimal places
- Voltage values are automatically converted from raw values (divided by 100)
- RSRP (signal strength) values are parsed from IEEE754 format
- Token IDs are extracted from specific positions in the data packets