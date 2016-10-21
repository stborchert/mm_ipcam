/**
 * Custom IPCam module.
 */

Module.register('mm_ipcam', {
    // Default module configuration.
  defaults: {
    showCamTitle: false,
    invertColors: false,
    cams: [
      {
        ip: '',
        port: '',
        user: '',
        password: '',
        title: ''
      }
    ]
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

      var cameras = this.config.cams;
      console.dir(cameras);

      for (var i = 0; i < cameras; i++) {
        var camPreviewWrapper = document.createElement('div');
        camPreviewWrapper.className = 'camera';
        if (this.config.showCamTitle && cameras[i].title.length > 0) {
          // Create title element.
          var titleWrapper = document.createElement('div');
          titleWrapper.className = 'title';
          titleWrapper.innerHTML = cameras[i].title;
          camPreviewWrapper.appendChild(titleWrapper);
        }
        // Generate preview URL.
        var url = 'http://';
        if (cameras[i].user.length > 0) {
          // Add username and (optional) password.
          url = url + cameras[i].user + ':';
          if (cameras[i].password.length > 0) {
            url = url + cameras[i].password;
          }
          url = url + '@';
        }
        url = url + cameras[i].ip;
        if (cameras[i].port.length > 0) {
          url = url + ':' + cameras[i].port;
        }
        // Add stream path.
        url = url + '/Streaming/channels/2/httpPreview';
        console.log(url);
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
