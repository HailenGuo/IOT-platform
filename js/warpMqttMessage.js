/**
 * Created by quanpower on 14-8-20.
 */

function wrapMqttMessage(topic, data){
    try{
        if(topic === 'tb'){
            if(typeof data !== 'string'){
                return JSON.stringify(data);
            }
            return data;
        }else{
            return JSON.stringify({topic: topic, data: data});
        }
    }catch(ex){
        console.log('error wrapping mqtt message', ex);
    }
}

module.exports = wrapMqttMessage;
