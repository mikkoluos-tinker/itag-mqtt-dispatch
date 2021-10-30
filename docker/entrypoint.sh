#!/bin/bash

service dbus start
bluetoothd &

node src/index.js
