import Homey from 'homey';
var http = require('http.min');

class MyDevice extends Homey.Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MyDevice has been initialized');
    if (this.hasCapability('measure_power') === false) {
      await this.addCapability('measure_power');
    }
    if (this.hasCapability('measure_temperature') === false) {
      await this.addCapability('measure_temperature');
    }
    if (this.hasCapability('phases') === false) {
      await this.addCapability('phases');
    }
    if (this.hasCapability('total_energy') === false) {
      await this.addCapability('total_energy');
    }
    if (this.hasCapability('session_energy') === false) {
      await this.addCapability('session_energy');
    }
    if (this.hasCapability('amp_limit') === false) {
      await this.addCapability('amp_limit');
    }
    let result = await this.getFreshData();
    this.setValues(result);
    setInterval( async () => {
      let result = await this.getFreshData();
      this.setValues(result);
    }, 1000);
  }

  async getFreshData(){
    let url = this.homey.settings.get('wallchargerip');

    var optionsConfig = {
      uri: `http://${url}:2222/rest/chargebox/status`,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    }
    var result = await http(optionsConfig);
    var jsonRes = await JSON.parse(result.data);
    return jsonRes;
  }

  async setValues(values: any){
    this.setCapabilityValue('measure_power', values.currentChargingPower);
    this.setCapabilityValue("measure_temperature", values.currentTemperature);
    this.setCapabilityValue("phases", values.nrOfPhases);
    this.setCapabilityValue("total_energy", (values.latestReading / 1000));
    this.setCapabilityValue("session_energy", values.accSessionEnergy);
    this.setCapabilityValue("amp_limit", values.currentLimit);
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyDevice has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings: {}, newSettings: {}, changedKeys: {} }): Promise<string|void> {
    this.log('MyDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('MyDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyDevice has been deleted');
  }

}

module.exports = MyDevice;
