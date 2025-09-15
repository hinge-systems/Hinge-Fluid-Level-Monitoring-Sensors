class Utility {
    static IEEE754_Hex_To_Float(hexString) {
        const buffer = Buffer.from(hexString, 'hex');
        return buffer.readFloatBE(0);
    }
}

class Hinge555Device {
    /**
     * Parse data to attr Hinge555 TCP
     * @param {string} reqData - Input data string in upper format
     * @returns {Object} - Contains attr_result and token_id
     * Examples:
     * "800001011E0692001A00000000016E008027C40001186962703655111781" - heart beat/alarm without gps
     * "80000103410604180A1E4B1E1460047427709661000200003132302E39322E38392E3132323B23823B3135392E3138382E342E363B22B83B000000000000000081" - event packet with gps
     */
    static parseData(reqData) {
        try {
            const dataType = reqData.substring(6, 8);
            const dataLen = parseInt(reqData.substring(8, 10), 16);
            let attrResult = "";
            let tokenId = "";

            if (dataLen === reqData.length / 2) {
                if (dataType === "01" || dataType === "02") {
                    if (dataLen === 30) {
                        // Parse heartbeat/alarm without GPS
                        tokenId = reqData.substring(43, 58);
                        const dataHeight = parseInt(reqData.substring(10, 14), 16);
                        const dataTemperature = parseInt(reqData.substring(16, 18), 16);
                        const angleSign = parseInt(reqData.substring(18, 20), 16) === 0;
                        const dataAngle = angleSign ? 
                            parseInt(reqData.substring(20, 22), 16) : 
                            -parseInt(reqData.substring(20, 22), 16);
                        const dataFullAlarm = parseInt(reqData.substring(22, 23), 16);
                        const dataFireAlarm = parseInt(reqData.substring(23, 24), 16);
                        const dataTiltAlarm = parseInt(reqData.substring(24, 25), 16);
                        const dataBatteryAlarm = parseInt(reqData.substring(25, 26), 16);
                        const dataVolt = parseInt(reqData.substring(26, 30), 16) / 100;
                        const dataRsrpOrigin = reqData.substring(30, 38);
                        const dataRsrp = parseInt(Utility.IEEE754_Hex_To_Float(dataRsrpOrigin));
                        const dataFrameCounter = parseInt(reqData.substring(38, 42), 16);

                        const attribute = {
                            height: dataHeight,
                            temperature: dataTemperature,
                            full_alarm: dataFullAlarm,
                            fire_alarm: dataFireAlarm,
                            tilt_alarm: dataTiltAlarm,
                            battery_alarm: dataBatteryAlarm,
                            volt: dataVolt,
                            angle: dataAngle,
                            rsrp: dataRsrp,
                            frame_counter: dataFrameCounter
                        };
                        attrResult = JSON.stringify(attribute);
                    } else {
                        // Parse event packet with GPS
                        tokenId = reqData.substring(59, 74);
                        const dataHeight = parseInt(reqData.substring(10, 14), 16);
                        const dataLongitudeOrigin = reqData.substring(16, 24);
                        const dataLongitude = Utility.IEEE754_Hex_To_Float(dataLongitudeOrigin).toFixed(6);
                        const dataLatitudeOrigin = reqData.substring(24, 32);
                        const dataLatitude = Utility.IEEE754_Hex_To_Float(dataLatitudeOrigin).toFixed(6);
                        const dataTemperature = parseInt(reqData.substring(32, 34), 16);
                        const angleSign = parseInt(reqData.substring(34, 36), 16) === 0;
                        const dataAngle = angleSign ? 
                            parseInt(reqData.substring(36, 38), 16) : 
                            -parseInt(reqData.substring(36, 38), 16);
                        const dataFullAlarm = parseInt(reqData.substring(38, 39), 16);
                        const dataFireAlarm = parseInt(reqData.substring(39, 40), 16);
                        const dataTiltAlarm = parseInt(reqData.substring(40, 41), 16);
                        const dataBatteryAlarm = parseInt(reqData.substring(41, 42), 16);
                        const dataVolt = parseInt(reqData.substring(42, 46), 16) / 100;
                        const dataRsrpOrigin = reqData.substring(46, 54);
                        const dataRsrp = parseInt(Utility.IEEE754_Hex_To_Float(dataRsrpOrigin));
                        const dataFrameCounter = parseInt(reqData.substring(54, 58), 16);

                        const attribute = {
                            height: dataHeight,
                            longitude: dataLongitude,
                            latitude: dataLatitude,
                            temperature: dataTemperature,
                            full_alarm: dataFullAlarm,
                            fire_alarm: dataFireAlarm,
                            tilt_alarm: dataTiltAlarm,
                            battery_alarm: dataBatteryAlarm,
                            volt: dataVolt,
                            angle: dataAngle,
                            rsrp: dataRsrp,
                            frame_counter: dataFrameCounter
                        };
                        attrResult = JSON.stringify(attribute);
                    }
                }
            } else {
                attrResult = JSON.stringify("");
                tokenId = "";
            }
            
            return { attrResult, tokenId };
        } catch (error) {
            console.error(error);
            return { attrResult: "", tokenId: "" };
        }
    }
}

class Hinge572Device {
    /**
     * Parse data to attr Hinge572 TCP
     * @param {string} reqData - Input data string in upper format
     * @returns {Object} - Contains attr_result and token_id
     * Examples:
     * "80 00 71 01 21 1D 75 01 CB 00 00 00 19 0A 00 00 01 66 00 00 39 C4 00 02 18 63 25 10 74 28 28 85 81" - heart beat/alarm without gps
     * "80 00 71 01 29 1D 75 01 CB 01 CD 03 E9 42 EF 27 20 42 00 00 19 0A 00 00 01 66 00 00 39 C4 00 02 18 63 25 10 74 28 28 85 81" - event packet with gps
     */
    static parseData(reqData) {
        try {
            const dataType = reqData.substring(6, 8);
            const dataLen = parseInt(reqData.substring(8, 10), 16);
            let attrResult = "";
            let tokenId = "";

            if (dataLen === reqData.length / 2) {
                if (dataType === "01" || dataType === "02") {
                    if (dataLen === 33) {
                        // Parse heartbeat/alarm without GPS
                        tokenId = reqData.substring(49, 64);
                        const dataLevelHeight = parseInt(reqData.substring(10, 14), 16);
                        const dataAirHeight = parseInt(reqData.substring(14, 18), 16);
                        const dataGpsEnabled = parseInt(reqData.substring(18, 20), 16);
                        const dataTemperature = parseInt(reqData.substring(24, 26), 16);
                        const dataHumidity = parseInt(reqData.substring(26, 28), 16);
                        const dataHeightAlarm = parseInt(reqData.substring(28, 29), 16);
                        const dataTemperatureAlarm = parseInt(reqData.substring(29, 30), 16);
                        const dataBatteryAlarm = parseInt(reqData.substring(31, 32), 16);
                        const dataVolt = parseInt(reqData.substring(32, 36), 16) / 100;
                        const dataRsrpOrigin = reqData.substring(36, 44);
                        const dataRsrp = parseInt(Utility.IEEE754_Hex_To_Float(dataRsrpOrigin));
                        const dataFrameCounter = parseInt(reqData.substring(44, 48), 16);

                        const attribute = {
                            liquidLevel: dataLevelHeight,
                            airHeight: dataAirHeight,
                            gpsEnabled: dataGpsEnabled,
                            temperature: dataTemperature,
                            humidity: dataHumidity,
                            levelAlarm: dataHeightAlarm,
                            temperatureAlarm: dataTemperatureAlarm,
                            batteryAlarm: dataBatteryAlarm,
                            volt: dataVolt,
                            rsrp: dataRsrp,
                            frameCounter: dataFrameCounter
                        };
                        attrResult = JSON.stringify(attribute);
                    } else if (dataLen === 41) {
                        // Parse event packet with GPS
                        tokenId = reqData.substring(65, 80);
                        const dataLevelHeight = parseInt(reqData.substring(10, 14), 16);
                        const dataAirHeight = parseInt(reqData.substring(14, 18), 16);
                        const dataGpsEnabled = parseInt(reqData.substring(18, 20), 16);
                        const dataLongitudeOrigin = reqData.substring(20, 28);
                        const dataLongitude = Utility.IEEE754_Hex_To_Float(dataLongitudeOrigin).toFixed(6);
                        const dataLatitudeOrigin = reqData.substring(28, 36);
                        const dataLatitude = Utility.IEEE754_Hex_To_Float(dataLatitudeOrigin).toFixed(6);
                        const dataTemperature = parseInt(reqData.substring(40, 42), 16);
                        const dataHumidity = parseInt(reqData.substring(42, 44), 16);
                        const dataHeightAlarm = parseInt(reqData.substring(44, 45), 16);
                        const dataTemperatureAlarm = parseInt(reqData.substring(45, 46), 16);
                        const dataBatteryAlarm = parseInt(reqData.substring(47, 48), 16);
                        const dataVolt = parseInt(reqData.substring(48, 52), 16) / 100;
                        const dataRsrpOrigin = reqData.substring(52, 60);
                        const dataRsrp = parseInt(Utility.IEEE754_Hex_To_Float(dataRsrpOrigin));
                        const dataFrameCounter = parseInt(reqData.substring(60, 64), 16);

                        const attribute = {
                            liquidLevel: dataLevelHeight,
                            airHeight: dataAirHeight,
                            gpsEnabled: dataGpsEnabled,
                            longitude: dataLongitude,
                            latitude: dataLatitude,
                            temperature: dataTemperature,
                            humidity: dataHumidity,
                            levelAlarm: dataHeightAlarm,
                            temperatureAlarm: dataTemperatureAlarm,
                            batteryAlarm: dataBatteryAlarm,
                            volt: dataVolt,
                            rsrp: dataRsrp,
                            frameCounter: dataFrameCounter
                        };
                        attrResult = JSON.stringify(attribute);
                    }
                } else if (dataLen >= 32) {
                    // Parse configuration data
                    tokenId = reqData.substring(dataLen * 2 - 17, reqData.length - 2);
                    const dataFirmwareVersion = `${parseInt(reqData.substring(10, 12), 16)}.${parseInt(reqData.substring(12, 14), 16)}`;
                    const dataUploadInterval = parseInt(reqData.substring(14, 16), 16);
                    const dataDetectInterval = parseInt(reqData.substring(16, 18), 16);
                    const dataHeightThreshold = parseInt(reqData.substring(18, 20), 16);
                    const dataTemperatureThreshold = parseInt(reqData.substring(20, 22), 16);
                    const dataBatteryThreshold = parseInt(reqData.substring(24, 26), 16);
                    const dataSuddentDropAlarmSwitch = parseInt(reqData.substring(44, 46), 16);
                    const dataSuddentDropAlarmThreshold = parseInt(reqData.substring(46, 50), 16);
                    const dataWorkMode = parseInt(reqData.substring(50, 52), 16);

                    const attribute = {
                        firmwareVersion: dataFirmwareVersion,
                        uploadInterval: dataUploadInterval,
                        detectInterval: dataDetectInterval,
                        heightThreshold: dataHeightThreshold,
                        TemperatureThreshold: dataTemperatureThreshold,
                        BatteryThreshold: dataBatteryThreshold,
                        SuddentDropAlarmSwitch: dataSuddentDropAlarmSwitch,
                        SuddentDropAlarmThreshold: dataSuddentDropAlarmThreshold,
                        workMode: dataWorkMode
                    };
                    attrResult = JSON.stringify(attribute);
                }
            } else {
                attrResult = JSON.stringify("");
                tokenId = "";
            }

            return { attrResult, tokenId };
        } catch (error) {
            console.error(error);
            return { attrResult: "", tokenId: "" };
        }
    }
}

module.exports = {
    Utility,
    Hinge555Device,
    Hinge572Device
};
