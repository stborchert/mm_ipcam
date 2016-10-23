/**
 * Custom IPCam module.
 */

Module.register('mm_ipcam', {
    // Default module configuration.
  defaults: {
    showCamTitle: false,
    invertColors: false,
    manufacturer: '',
    model: '',
    channel: '1',
    user: '',
    password: '',
    cams: [
      {
        ip: '',
        port: '',
        user: '',
        password: '',
        title: '',
        channel: '1',
        manufacturer: '',
        model: ''
      }
    ]
  },

  /**
   * Override start().
   */
  start: function() {
    this.camera_definitions = {};
    // Request node helper to read camera definitions.
    this.sendSocketNotification('INSTANTIATE_MM_IPCAM', {});
  },

  /**
   * Override socketNotificationReceived().
   */
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'MM_IPCAM_DEFINITIONS') {
      this.camera_definitions = payload.definitions;
      this.updateDom();
    }
  },

  /**
   * Get list of all configured cameras.
   *
   * @return array
   *   List of all valid camera configurations.
   */
  getCameras: function() {
    var cams = [];
    for (var i = 0; i < this.config.cams.length; i++) {
      if (typeof this.config.cams[i] == "undefined") {
        continue;
      }
      if (this.config.cams[i].ip.length == 0) {
        continue;
      }
      cams.push(this.config.cams[i]);
    }
    return cams;
  },

  /**
   * @{inheritDoc}
   */
  getDom: function() {
    var wrapper = document.createElement('div');
    wrapper.className = 'ipcams';

    if (Object.keys(this.camera_definitions).length == 0) {
      // Wait for definitions.
      return wrapper;
    }

    var cameras = this.getCameras() || [];

    for (var i = 0; i < cameras.length; i++) {
      var camPreviewWrapper = document.createElement('div');
      camPreviewWrapper.className = 'camera';
      if (this.config.showCamTitle && cameras[i].title.length > 0) {
        // Create title element.
        var titleWrapper = document.createElement('div');
        titleWrapper.className = 'title';
        titleWrapper.innerHTML = cameras[i].title;
        camPreviewWrapper.appendChild(titleWrapper);
      }
      var protocol = cameras[i].protocol || this.config.protocol || 'http';
      // Get camera manufacturer from config.
      var manufacturer = cameras[i].manufacturer || this.config.manufacturer;
      // Get model from config.
      var model = cameras[i].model || this.config.model;
      // Try to load definitions for manufacturer.
      if (!this.camera_definitions.hasOwnProperty(manufacturer)) {
        Log.info('Unknown manufacturer: ' + manufacturer);
        // Use generic manufacturer.
        manufacturer = '*';
      }
      // Try to load definitions for model.
      if (!this.camera_definitions[manufacturer].hasOwnProperty(model)) {
        Log.info('Unknown model: ' + model);
        // Use generic model.
        model = '*';
      }

      // Generate preview URL.
      var url = this.camera_definitions[manufacturer][model]['url_scheme'];
      url = url.replace('{protocol}', protocol);

      var credentials = '';
      var username = cameras[i].user || this.config.user || '';
      var password = cameras[i].password || this.config.password || '';
      if (username.length > 0) {
        // Add username and (optional) password.
        credentials = username + ':';
        if (password.length > 0) {
          credentials = credentials + password;
        }
        credentials = credentials + '@';
      }
      url = url.replace('{credentials}', credentials);

      // Build base URL.
      var base_url = '';
      base_url = cameras[i].ip;
      if (cameras[i].port.length > 0) {
        base_url = base_url + ':' + cameras[i].port;
      }
      url = url.replace('{base_url}', base_url);

      var channel = cameras[i].channel || this.config.channel || '';
      url = url.replace('{channel}', channel);

      Log.info('Stream video from url: ' + url);
      // Create image output.
      var camPreview = document.createElement('img');
      camPreview.src = url;
      if (this.config.invertColors) {
        camPreview.setAttribute("style", "-webkit-filter: invert(100%); max-width: 100%; max-height: 100%; height: 280px; ");
      }
      else {
        camPreview.setAttribute("style", "max-width: 100%; max-height: 100%; height: 280px; opacity:0.7; -moz-opacity:0.7; filter:alpha(opacity=70);");
      }
      camPreviewWrapper.appendChild(camPreview);

      // Append preview to main wrapper.
      wrapper.appendChild(camPreviewWrapper);
    }

    return wrapper;
  }
});
