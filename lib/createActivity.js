/**
 * Created by quanpower on 14-8-21.
 */


function getActivity(topic, ip, device, toDevice){
    var data = {ipAddress: ip};
    if(topic){
        data.topic = topic;
    }
    if(device && device.type){
        data.type = device.type;
    }
    if(toDevice && toDevice.ipAddress){
        data.toIpAddress = toDevice.ipAddress;
    }
    if(toDevice && toDevice.type){
        data.toType = toDevice.type;
    }
    return data;
}

module.exports = getActivity;
