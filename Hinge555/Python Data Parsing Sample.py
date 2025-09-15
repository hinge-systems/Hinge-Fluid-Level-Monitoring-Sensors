# Add Hinge555 4G support.

import utility
import json

class Hinge555Device(object):
    # Func: parse data to attr Hinge555 TCP
    # Param: req_data: input data string in upper format
    #        attr_output: output attr
    #       token_code: token for thingsboard, imei
    # "80 00 16 02 1E 0265 00 00 0000 0000 0168 008045C4 1865385060029872 0001 81“ heart beat/alarm without gps
    # "80 00 16 03 20 0405 003C 0A 1E 4B 1E 14 1460081912008446 00 1865385060029872 81" event packet with gps
    # "" Param
    def parse_hinge_data(req_data):
        try:
            dtype = req_data[6:8]
            dlen = int(req_data[8:10], 16)
            global attr_output
            global token_code
            if dlen == len(req_data) / 2:
                if dtype in ("01", "02"):
                    if dlen == 34:
                        token_code = req_data[51:66]
                        height_val = int(req_data[10:14], 16)
                        gps_flag = int(req_data[14:16], 16)
                        temp_val = int(req_data[16:18], 16)
                        empty_alarm = int(req_data[22:23], 16)
                        battery_alarm = int(req_data[25:26], 16)
                        voltage = int(req_data[26:30], 16) / 100
                        rsrp_hex = req_data[30:38]
                        rsrp_val = int(utility.utility.IEEE754_Hex_To_Float(rsrp_hex))
                        frame_count = int(req_data[38:42], 16)
                        timestamp_val = int(req_data[42:50], 16)
                        attr_dict = {
                            "height": height_val,
                            "gps_enabled": gps_flag,
                            "empty_alarm": empty_alarm,
                            "battery_alarm": battery_alarm,
                            "volt": voltage,
                            "rsrp": rsrp_val,
                            "frameCounter": frame_count,
                            "timeStamp": timestamp_val
                        }
                    elif dlen == 42:
                        token_code = req_data[67:82]
                        height_val = int(req_data[10:14], 16)
                        gps_flag = int(req_data[14:16], 16)
                        longitude_hex = req_data[16:24]
                        longitude_val = utility.utility.IEEE754_Hex_To_Float(longitude_hex)
                        longitude_val = ("%.6f" % longitude_val)
                        latitude_hex = req_data[24:32]
                        latitude_val = utility.utility.IEEE754_Hex_To_Float(latitude_hex)
                        latitude_val = ("%.6f" % latitude_val)
                        temp_val = int(req_data[32:34], 16)
                        empty_alarm = int(req_data[38:39], 16)
                        battery_alarm = int(req_data[41:42], 16)
                        voltage = int(req_data[42:46], 16) / 100
                        rsrp_hex = req_data[46:54]
                        rsrp_val = int(utility.utility.IEEE754_Hex_To_Float(rsrp_hex))
                        frame_count = int(req_data[54:58], 16)
                        timestamp_val = int(req_data[58:66], 16)
                        attr_dict = {
                            "height": height_val,
                            "gpsEnabled": gps_flag,
                            "longitude": longitude_val,
                            "latitude": latitude_val,
                            "temperature": temp_val,
                            "heightAlarm": empty_alarm,
                            "batteryAlarm": battery_alarm,
                            "volt": voltage,
                            "rsrp": rsrp_val,
                            "frameCounter": frame_count,
                            "timeStamp": timestamp_val
                        }
                    else:
                        attr_dict = {}
                elif dlen >= 32:
                    token_code = req_data[dlen*2-17:-2]
                    firmware_ver = f"{int(req_data[10:12],16)}.{int(req_data[12:14],16)}"
                    upload_interval = int(req_data[14:16],16)
                    detect_interval = int(req_data[16:18], 16)
                    height_threshold = int(req_data[18:20], 16)
                    temp_threshold = int(req_data[20:22], 16)
                    imsi_val = req_data[25:40]
                    work_mode = int(req_data[44:46], 16)
                    attr_dict = {
                        "firmwareVersion": firmware_ver,
                        "uploadInterval": upload_interval,
                        "detectInterval": detect_interval,
                        "heightThreshold": height_threshold,
                        "temperatureThreshold": temp_threshold,
                        "imsi": imsi_val,
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
        incoming_data = "80000503330202020A1E4B0F14600456077004020002000047.104.191.39;1990;159.138.4.6;7788;186437604696736981"
        attr_output = Hinge555Device.parse_hinge_data(incoming_data)
    except Exception as e:
        print(e)
