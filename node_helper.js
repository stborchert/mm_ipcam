/**
 * NodeHelper for module "IPCam".
 */

var NodeHelper = require('node_helper');

module.exports = NodeHelper.create({

  /**
   * Override socketNotificationReceived().
   */
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'INSTANTIATE_MM_IPCAM') {
      this.getCameraDefinitions();
    }
  },

  /**
   * Helper to load additional configuration.
   */
  getCameraDefinitions: function() {
    var self = this;
    var yaml = require('js-yaml');
    var fs = require('fs');
    var definitions = custom_definitions = {};
    // Import default definitions.
    if (fs.existsSync(__dirname + '/camera_definitions.yml')) {
      definitions = yaml.safeLoad(fs.readFileSync(__dirname + '/camera_definitions.yml', 'UTF-8'));
    }
    // Import custom definitions.
    if (fs.existsSync(__dirname + '/camera_definitions.custom.yml')) {
      custom_definitions = yaml.safeLoad(fs.readFileSync(__dirname + '/camera_definitions.custom.yml'));
    }

    self.sendSocketNotification('MM_IPCAM_DEFINITIONS', {
      definitions: Object.assign({}, definitions, custom_definitions)
    });
  }

});

