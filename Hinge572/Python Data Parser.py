# Add hinge572 4G version support.

import utility
import json


class Hinge572Device(object):
    # Func: parse data to attr hinge572 TCP
    # Param: req_data: input data string in upper format
    #        attr_output: output attr
    #       token_code: use for DeviceID, imei
    # "80 00 71 01 21 1D 75 01 CB 00 00 00 19 0A 00 00 01 66 00 00 39 C4 00 02 18 63 25 10 74 28 28 85 81“ heart beat/alarm without gps
    # "80 00 71 01 29 1D 75 01 CB 01 CD 03 E9 42 EF 27 20 42 00 00 19 0A 00 00 01 66 00 00 39 C4 00 02 18 63 25 10 74 28 28 85 81" event packet with gps
    # "" Param
    def parse_hinge_data(req_data):
        try:
            dtype = req_data[6:8]
            dlen = int(req_data[8:10], 16)
            global attr_output
            global token_code
            if dlen == len(req_data) / 2:
                if dtype in ("01", "02"):
                    if dlen == 33:
                        token_code = req_data[49:64]
                        liquid_height = int(req_data[10:14], 16)
                        air_height = int(req_data[14:18], 16)
                        gps_flag = int(req_data[18:20], 16)
                        temp_value = int(req_data[24:26], 16)
                        humidity_value = int(req_data[26:28], 16)
                        height_alarm = int(req_data[28:29], 16)
                        temp_alarm = int(req_data[29:30], 16)
                        battery_alarm = int(req_data[31:32], 16)
                        voltage = int(req_data[32:36], 16) / 100
                        rsrp_hex = req_data[36:44]
                        rsrp_val = int(utility.utility.IEEE754_Hex_To_Float(rsrp_hex))
                        frame_count = int(req_data[44:48], 16)
                        attr_dict = {
                            "liquidLevel": liquid_height,
                            "airHeight": air_height,
                            "gpsEnabled": gps_flag,
                            "temperature": temp_value,
                            "humidity": humidity_value,
                            "levelAlarm": height_alarm,
                            "temperatureAlarm": temp_alarm,
                            "batteryAlarm": battery_alarm,
                            "volt": voltage,
                            "rsrp": rsrp_val,
                            "frameCounter": frame_count
                        }
                    elif dlen == 41:
                        token_code = req_data[65:80]
                        liquid_height = int(req_data[10:14], 16)
                        air_height = int(req_data[14:18], 16)
                        gps_flag = int(req_data[18:20], 16)
                        longitude_hex = req_data[20:28]
                        longitude_val = utility.utility.IEEE754_Hex_To_Float(longitude_hex)
                        longitude_val = ("%.6f" % longitude_val)
                        latitude_hex = req_data[28:36]
                        latitude_val = utility.utility.IEEE754_Hex_To_Float(latitude_hex)
                        latitude_val = ("%.6f" % latitude_val)
                        temp_value = int(req_data[40:42], 16)
                        humidity_value = int(req_data[42:44], 16)
                        height_alarm = int(req_data[44:45], 16)
                        temp_alarm = int(req_data[45:46], 16)
                        battery_alarm = int(req_data[47:48], 16)
                        voltage = int(req_data[48:52], 16) / 100
                        rsrp_hex = req_data[52:60]
                        rsrp_val = int(utility.utility.IEEE754_Hex_To_Float(rsrp_hex))
                        frame_count = int(req_data[60:64], 16)
                        attr_dict = {
                            "liquidLevel": liquid_height,
                            "airHeight": air_height,
                            "gpsEnabled": gps_flag,
                            "longitude": longitude_val,
                            "latitude": latitude_val,
                            "temperature": temp_value,
                            "humidity": humidity_value,
                            "levelAlarm": height_alarm,
                            "temperatureAlarm": temp_alarm,
                            "batteryAlarm": battery_alarm,
                            "volt": voltage,
                            "rsrp": rsrp_val,
                            "frameCounter": frame_count
                        }
                    else:
                        attr_dict = {}
                elif dlen >= 32:
                    token_code = req_data[dlen*2-17:-2]
                    firmware_ver = f"{int(req_data[10:12], 16)}.{int(req_data[12:14], 16)}"
                    upload_interval = int(req_data[14:16], 16)
                    detect_interval = int(req_data[16:18], 16)
                    height_threshold = int(req_data[18:20], 16)
                    temp_threshold = int(req_data[20:22], 16)
                    battery_threshold = int(req_data[24:26], 16)
                    sudden_drop_switch = int(req_data[44:46], 16)
                    sudden_drop_threshold = int(req_data[46:50], 16)
                    work_mode = int(req_data[50:52], 16)
                    attr_dict = {
                        "firmwareVersion": firmware_ver,
                        "uploadInterval": upload_interval,
                        "detectInterval": detect_interval,
                        "heightThreshold": height_threshold,
                        "TemperatureThreshold": temp_threshold,
                        "BatteryThreshold": battery_threshold,
                        "SuddentDropAlarmSwitch": sudden_drop_switch,
                        "SuddentDropAlarmThreshold": sudden_drop_threshold,
                        "workMode": work_mode,
                    }
                else:
                    attr_dict = {}
                attr_output = json.dumps(attr_dict)
            else:
                attr_output = json.dumps("")
                token_code = ""
        except Exception as e:
            print(e)
        finally:
            return attr_output, token_code


if __name__ == "__main__":
    try:
        attr_output = ""
        incoming_data = "80007103340102180A1E4B1E14186325107428288501000064003132392E3232362E31312E33303B29403B186325107428288581"
        attr_output = Hinge572Device.parse_hinge_data(incoming_data)
    except Exception as e:
        print(e)
