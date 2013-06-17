var gpsTracker;



/**
 * Class to aggregate geo data in. Data for a single GPS report comes in from
 * the remote device over more than one read.
 * @constructor
 */
function GeoData() {
  'use strict';

  this.time = '';
  this.date = '';
  this.fix = 0;
  this.quality = 0;
  this.lat = 0.0;
  this.lon = 0.0;
  this.knots = 0.0;
  this.angle = 0.0;
  this.altitude = 0.0;
  this.satellites = 0;
  /**
   * Builds a string representing the row in the table for this data.
   * @this {GeoData}
   * @return {String} HTML for a row in the data table.
   */
  this.getTableRow = function() {
    var s = '<tr><td>' + this.date + '</td>';
    s += '<td>' + this.time + '</td>';
    s += '<td>' + this.fix + '</td>';
    s += '<td>' + this.quality + '</td>';
    s += '<td>' + this.lat.toFixed(7) + '</td>';
    s += '<td>' + this.lon.toFixed(7) + '</td>';
    s += '<td>' + this.altitude + '</td>';
    s += '<td>' + this.angle + '</td>';
    s += '<td>' + this.knots + '</td>';
    s += '<td>' + this.satellites + '</td></tr>';
    return s;
  };
}



/**
 * Class that listens to the serial port and updates the table with the parsed
 * data.
 * @constructor
 * @param {Number} connId - Identifies the connection to the Chrome serial API.
 */
function GpsTracker(connId) {
  'use strict';
  this.connectionId = connId;
  this.curGeo = new GeoData();
  this.curLine = '';

  /**
   * Accumulate serial data into lines.
   * @this {GpsTracker}
   * @param {object} readInfo - contains the bytes read.
   */
  this.onCharRead = function(readInfo) {
    if (!this.connectionId) {
      return;
    }
    if (readInfo && readInfo.bytesRead > 0 && readInfo.data) {
      var str = String.fromCharCode.apply(null, new Uint8Array(readInfo.data));
      for (var i = 0; i < readInfo.bytesRead; i++) {
        if (str[i] === '\n') {
          this.parseLine(this.curLine);
          this.curLine = '';
        } else {
          this.curLine += str[i];
        }
      }
    }
    /* Keep on reading... */
    chrome.serial.read(this.connectionId, 512, this.onCharRead.bind(this));
  };

  /**
   * Parse a DDDMM.MMMMC string into a decimal degree number.
   * @param {string} ddm - Degrees & decimal minutes plus a direction character.
   * @return {Number} decimal degrees.
   */
  this.parseDecDeg = function(ddm) {
    var i = ddm.indexOf('.');
    var deg = ddm.substring(0, i - 2);
    var decMin = ddm.substring(i - 2, ddm.length - 1);
    var dir = ddm.charAt(ddm.length - 1);
    var decDeg = parseInt(deg, 10) + (decMin / 60.0);
    if (dir === 'W' || dir === 'S') {
      decDeg *= -1;
    }
    return decDeg;
  };

  /**
   * Parse the line of received text. Based on the first characters update
   * the current GeoData object. Send the data to the table and map once
   * enough is collected.
   * @this {GpsTracker}
   * @param {String} line - the line of text to be processed.
   */
  this.parseLine = function(line) {
    var delim = 0;
    switch (line.substring(0, 2)) {
      case 'Ti':
        this.curGeo = new GeoData();
        this.curGeo.time = line.substring(6);
        break;
      case 'Da':
        this.curGeo.date = line.substring(6);
        break;
      case 'Fi':
        delim = line.indexOf(' q');
        this.curGeo.fix = line.substring(5, delim);
        this.curGeo.quality = line.substring(delim + 10);
        if (this.curGeo.fix === '0') {
          $('#geoTable').append(this.curGeo.getTableRow());
        }
        break;
      case 'Lo':
        delim = line.indexOf(',');
        this.curGeo.lat = this.parseDecDeg(line.substring(10, delim).trim());
        this.curGeo.lon = this.parseDecDeg(line.substring(delim + 1).trim());
        this.updateMap(this.curGeo.time, this.curGeo.lat, this.curGeo.lon);
        break;
      case 'Sp':
        this.curGeo.knots = line.substring(15);
        break;
      case 'An':
        this.curGeo.angle = line.substring(7);
        break;
      case 'Al':
        this.curGeo.altitude = line.substring(10);
        break;
      case 'Sa':
        this.curGeo.satellites = line.substring(12);
        $('#geoTable').append(this.curGeo.getTableRow());
        break;
    }
  };

  /**
   * Push geo information into sandboxed map.html page hosting a Google Map.
   * @param {String} time - in GMT the observation was made.
   * @param {Number} lat - Latitude in decimal degrees.
   * @param {Number} lon - Longitude in decimal degrees.
   */
  this.updateMap = function(time, lat, lon) {
    var mf = document.getElementById('mapFrame');
    mf.contentWindow.postMessage(time + ',' + lat + ',' + lon, '*');
  };

  /**
   * Close the connection. After calling this method the tracker will no longer
   * be valid.
   * @this {GpsTracker}
   */
  this.close = function() {
    chrome.serial.close(this.connectionId, function() {
      this.connectionId = 0;
      console.log('Serial port closed');
    });
  };

  /* Start reading once this object has been created. */
  chrome.serial.read(this.connectionId, 512, this.onCharRead.bind(this));
}


/**
 * Entry point for the application. Sets up the UI elements' data and
 * behaviour.
 */
onload = function() {
  'use strict';

  /* Get a list of serial ports and populate the select element with them. */
  chrome.serial.getPorts(function(ports) {
    var dd = $('#portDropdown');
    for (var i = 0; i < ports.length; i++) {
      dd.append($('<option>' + ports[i] + '</option>')
          .attr({ value: ports[i] }).addClass('text'));
    }
  });
  /* open button */
  $('#openPort').click(function() {
    if (gpsTracker) {
      return;
    }
    var portName = $('#portDropdown').val();
    chrome.serial.open(portName, {bitrate: 115200}, function(connInfo) {
      gpsTracker = new GpsTracker(connInfo.connectionId);
    });
  });
  /* close button */
  $('#closePort').click(function() {
    if (gpsTracker) {
      gpsTracker.close();
      gpsTracker = 0;
    }
  });
};

