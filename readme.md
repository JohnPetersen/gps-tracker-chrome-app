GPS Tracker
===========

Purpose
-------
This is a simple Chrome Packaged-App that will listen on a serial connection for formatted text GPS data and print it on a table and a Google Map.

It was created to visualize the range of xBee radios used in another project.

How it Works
------------
An Adafruit Ultimate GPS module (http://www.adafruit.com/products/746) generates raw NMEA messages which are sent over a software serial connection to an Arduino running the example sketch for parsing NMEA messages. The sketch and GPS library can be found on Adafruit's GitHub page: https://github.com/adafruit/Adafruit-GPS-Library
The sketch parses the NMEA and sends text messages out the Arduino's hardware serial port which is connected to a xBee radio. The xBee is configured to communicated with another one connected to the PC running the GPS Tracker packaged app.
The packaged app connects to the local xBee's serial port and displays the received data.

Note: In the sketch set "GPSECHO" to false, otherwise the raw NMEA messages will be echoed.

Installing the App
------------------
1. Download the project to a local directory.
2. Create a file called apiKeys.js with a variable named mapKey set to the value of your Google Maps API key.
    var mapKey = "AIzaSyCPndpkMJ6A8UTSI4swRPiANyxReji5fKA";
3. Follow the instructions for installing and running packaged apps in developer mode within the Chrome runtime:
   http://developer.chrome.com/apps/first_app.html#five

Example GPS Data
----------------
Time: 16:9:34.0
Date: 15/6/2013
Fix: 1 quality: 2
Location: 3852.1442N, 12118.9785W
Speed (knots): 0.11
Angle: 249.96
Altitude: 36.00
Satellites: 5

Time is GMT
Fix 0: no geo data, 1: geo data is valid
Location is in DDDMM.MMMMC format where DDD is degree value, MM.MMMM is decimal minutes and the C is the compass direction.
Angle is the track angle in degrees.
Altitude is in meters above mean sea level.

TODO
----
1. Make the data table scroll. Currently the data table does not scroll when the rows reach the bottom of the window. This should be fixed.
2. Save data as KML. Save to the local file system a KML file containing the received path.
3. Change button states based on connection. Collapse the two buttons into one that is an open button when not connected and a close button when a connection exists.

