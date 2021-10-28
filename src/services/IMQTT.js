const mqtt = require("mqtt");
const log = require("winston"); 

class IMQTT {
  static client = null;
  static baseTopic = "device_tracker";
  
  static connect (env) {
    if (env.MQTT_BASE_TOPIC?.length)
      this.baseTopic = env.MQTT_BASE_TOPIC;
    
    const config = {
      username: env.MQTT_USERNAME,
      password: env.MQTT_PASSWORD,
      will: {
        topic: `${this.baseTopic}/IMQTT/status`,
        payload: 'Offline',
        retain: true
      }
    };
 
    this.client = mqtt.connect(env.MQTT_URL, config);
    this.client.on("connect", this.publishConnect.bind(this));
    return this;
  }
  static publishConnect() {
    if (!this.client)
      return this.throwNotConnectedError();
    
    log.info(`MQTT ${this.baseTopic}/IMQTT/status Online`);
    this.client.publish(`${this.baseTopic}/IMQTT/status`, 'Online', {
      retain: true
    });
  }
  static publishDiscovered(device) {
    if (!this.client)
      return this.throwNotConnectedError();
    
    log.info(`MQTT ${this.baseTopic}/IMQTT/discovery ${device}`);
    this.client.publish(`${this.baseTopic}/IMQTT/discovery`, device, {
      retain: true
    });
  }
  static addDeviceToHass(device) {
    log.info(`Advising home assistant to discover this device: ${device}`);
    
    const config = {
      "name": device,
      "state_topic": `${this.baseTopic}/${device}/state`,
      "payload_home": "present",
      "payload_not_home": "away",
      "source_type": "bluetooth"
    }
    
    this.client.publish(`homeassistant/${this.baseTopic}/${device}/config`, JSON.stringify(config), {
      retain: true
    });
  }
  
  static publishPresent(device, status) {
    if (!this.client)
      return this.throwNotConnectedError();
    
    if (["present", "away"].includes(status) === false)
      return this.throwInvalidStatusError();
    
    log.debug(`MQTT publishNearby ${device} ${status}`);
    this.client.publish(`${this.baseTopic}/${device}/state`, status, {
      retain: true
    });
  }
  static publishTimeout(device) {
    this.publishPresent(device, "away");
  }
  static publishNearby(device) {
    this.publishPresent(device, "present");
  }
  static throwNotConnectedError() {
    throw "MQTT client not connected!";
  }
  static throwInvalidStatusError() {
    throw "invalid status for MQTT topic!";
  }
}

module.exports = IMQTT.connect(process.env);
