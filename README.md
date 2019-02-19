# bleGadgetNodeJS
NodeJS based application to boot Raspberry Pi as BLE gadget

# PiGadgetBLE implementation using nodeJS library ```bleno```
 
Master Git REPO for NodeJS BLE implementation: https://github.com/noble/bleno

This application bleGadget.js is modified to advertise custom payload. The instruction guide Bluetooth Developer Starter Kit - Profile Implementation and Testing -  RaspberryPi - V5.0.pdf has details on how to create the application step-by-step.
 
## Prerequisites for Debian/Raspbian for using NodeJS version
 
```sh
sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev
```
 
Make sure ```node``` is on your path, if it's not, some options:
 * symlink ```nodejs``` to ```node```: ```sudo ln -s /usr/bin/nodejs /usr/bin/node```
 * [install Node.js using the NodeSource package](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)
 
Node can also be installed using ```npm install nodejs```.
 
Upon installing node, install the module as below:
```npm install <path to bleno folder>```
 
## Start Raspberry Pi as BLE gadget using NodeJS version
 
Issue the command ```sudo node bleGadget.js``` to make Raspberry Pi
discoverables as a bluetooth gadget with BLE and BR/EDR capabilites.
 
Issue the command ```sudo node bleGadget.js LEONLY``` to make Raspberry Pi
discoverable as a bluetooth gadget with only BLE capabilities. 
 
The device will be discoverable now under **ALXG** name.
  
## Pairing the BLE Gadget 
 
Open **nRF Connect** app (Available in Android app store) and scan for the
devices. Pair with the device named **ALXG** and continue the development.

## Sample starter kit with detailed instructions can be found at: https://www.bluetooth.com/develop-with-bluetooth/build/developer-kits/bluetooth-starter-kit
