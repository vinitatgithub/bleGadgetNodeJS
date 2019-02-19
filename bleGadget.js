var bleno = require('bleno');

var link_loss_alert_level = 0;
var bleOnly = 0; //0 => supports both BLE and BR/EDR; 1 => supports BLE only
const args = process.argv;

if (args[2] === undefined) {
	console.log('no args provided. Configuring for both BLE and BR/EDR');
} else {
	if (args[2].toUpperCase() === 'LEONLY') {
		console.log('Found arg to configure only BLE.');
		bleOnly = 1;
	}
}
/*
process.argv.forEach(function(val, index, array) {
	console.log(index+': '+val);
});
*/
bleno.on('stateChange', function (state) { 
    console.log('on -> stateChange: ' + state);
    if (state === 'poweredOn') {
    //bleno.startAdvertising('BDSK', ['FE03'], bleOnly);

    var advertisementDataLength = 31; //31 is the max supported length for the advertisement data
    var scanDataLength = 0;
    var serviceUuids16bit = [];
    var serviceUuids = ['FE03'];
    var name = 'BDSK';
    var i = 0;
    //if (name && name.length) {
    //    scanDataLength += 2 + name.length;
    //}
    if (serviceUuids && serviceUuids.length) {
        for (i = 0; i < serviceUuids.length; i++) {
            var serviceUuid = new Buffer(serviceUuids[i].match(/.{1,2}/g).reverse().join(''), 'hex');
            if (serviceUuid.length === 2) {
                serviceUuids16bit.push(serviceUuid);
            } else if (serviceUuid.length === 16) {
                serviceUuids128bit.push(serviceUuid);
            }
        }
    }
    var advertisementData = new Buffer(advertisementDataLength);
    //var scanData = new Buffer(scanDataLength);

    //flags
    advertisementData.writeUInt8(2, 0);
    advertisementData.writeUInt8(0x01, 1);
    if (bleOnly === 1) {
      // set the advertising flags to advertise only for BLE mode ie 0000 0110
      advertisementData.writeUInt8(0x06, 2);
      console.log('will advertise only for BLE');
    } else {
      // set the advertising flags to advertise for both BLE and BR/EDR mode ie 0001 1000
      advertisementData.writeUInt8(0x1A, 2);
      console.log('will advertise for both BLE and BR/EDR');
    }
    var advertisementDataOffset = 3;
     
    if (serviceUuids16bit.length) {
      advertisementData.writeUInt8(1 + 2 * serviceUuids16bit.length, advertisementDataOffset);
      advertisementDataOffset++;
         
      advertisementData.writeUInt8(0x03, advertisementDataOffset);
      advertisementDataOffset++;
         
      for (i = 0; i < serviceUuids16bit.length; i++) {
        serviceUuids16bit[i].copy(advertisementData, advertisementDataOffset);
        advertisementDataOffset += serviceUuids16bit[i].length;
      }
    }
    //name
    var scanData;
    if (name && name.length) {
      var nameBuffer = new Buffer(name);
      scanDataLength += 2 + name.length;
      scanData = new Buffer(scanDataLength);
   
      scanData.writeUInt8(1 + nameBuffer.length, 0);
      scanData.writeUInt8(0x08, 1);
      nameBuffer.copy(scanData, 2);
    }
      
    var serviceDataTagLen = 1;
    var serviceDataTag = 0x16;
    var serviceUUIDLen = 2;
    var serviceUUID = 0xFE03;
    var vendorIDLen = 2;
    var vendorID = 0x0171;
    var productIDLen = 2;
    var productID = 0x0006;
    var accessoryColorLen = 1;
    var accessoryColor = 0x00;
    var deviceStateBitMaskLen = 1;
    var deviceStateBitMask = 0x00;
    var transportPreferenceLen = 1;
    var transportPreference = 0x00;
    var reservedPayloadLen = 3;
    var reservedPayload = 0x00;
    var productSpecificPayloadLen = 10;
    var productSpecificPayload = 0x00;
      
    var serviceDataLengthLen = 1;
    var serviceDataLength = serviceDataTagLen + serviceUUIDLen + vendorIDLen 
            + productIDLen + accessoryColorLen + deviceStateBitMaskLen 
            + transportPreferenceLen + reservedPayloadLen + productSpecificPayloadLen; 
    advertisementData.writeUIntBE(serviceDataLength, advertisementDataOffset, serviceDataLengthLen);
    advertisementDataOffset += serviceDataLengthLen;
 
    advertisementData.writeUIntBE(serviceDataTag, advertisementDataOffset, serviceDataTagLen);
    advertisementDataOffset += serviceDataTagLen;
 
    advertisementData.writeUIntBE(serviceUUID, advertisementDataOffset, serviceUUIDLen);
    advertisementDataOffset += serviceUUIDLen;
 
    advertisementData.writeUIntBE(vendorID, advertisementDataOffset, vendorIDLen);
    advertisementDataOffset += vendorIDLen;
    
    advertisementData.writeUIntBE(productID, advertisementDataOffset, productIDLen);
    advertisementDataOffset += productIDLen;
    
    advertisementData.writeUIntBE(accessoryColor, advertisementDataOffset, accessoryColorLen);
    advertisementDataOffset += accessoryColorLen;
    
    advertisementData.writeUIntBE(deviceStateBitMask, advertisementDataOffset, deviceStateBitMaskLen);
    advertisementDataOffset += deviceStateBitMaskLen;
    
    advertisementData.writeUIntBE(transportPreference, advertisementDataOffset, transportPreferenceLen);
    advertisementDataOffset += transportPreferenceLen;
    
    advertisementData.writeUIntBE(reservedPayload, advertisementDataOffset, reservedPayloadLen);
    advertisementDataOffset += reservedPayloadLen;
 
    advertisementData.writeUIntBE(productSpecificPayload, advertisementDataOffset, productSpecificPayloadLen);
    advertisementDataOffset += productSpecificPayloadLen;
 
    console.log(advertisementData);
    
    bleno.startAdvertisingWithEIRData(advertisementData, scanData);
	} else {
		bleno.stopAdvertising();
	} 
});

bleno.on('advertisingStart', function (error) {
	console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));
	if (!error) {
	        bleno.setServices([
			//  link loss service
			new bleno.PrimaryService({
				uuid: '1803',
				characteristics: [
					// Alert Level
					new bleno.Characteristic({
						value: 0,
					        uuid: '2A06',
					        properties: ['read', 'write'],
					        onReadRequest: function (offset, callback) { 
							console.log('link loss.alert level READ:'); 
							data = [0x00];
							data[0] = link_loss_alert_level;
							var octets = new Uint8Array(data);
							console.log(octets);
							callback(this.RESULT_SUCCESS, octets);
					        },
					        onWriteRequest: function (data, offset, withoutResponse, callback) { 
							console.log('link loss.alert level WRITE:');
							this.value = data;
							var octets = new Uint8Array(data);
							console.log('octets: '+octets);
							console.log('0x'+u8AToHexString(octets).toUpperCase());
							//application logic for handing WRITE goes here
							callback(this.RESULT_SUCCESS);
				                }
					})
				]
			}),
			//  immediate alert service
			new bleno.PrimaryService({
			        uuid: '1802',
			        characteristics: [
			                // Alert Level
			                new bleno.Characteristic({
			                        value: 0,
			                        uuid: '2A06',
			                        properties: ['writeWithoutResponse'], 
						onWriteRequest: function (data, offset, withoutResponse, callback) {
							console.log('immediate alert.alert level WRITE:'); 
							this.value = data;
							var octets = new Uint8Array(data);
							console.log('0x'+u8AToHexString(octets).toUpperCase());
							callback(this.RESULT_SUCCESS);
					        }
					})
				]
			}),
		        //  TX power service
		        new bleno.PrimaryService({
		                uuid: '1804',
		                characteristics: [
					// Power Level
					new bleno.Characteristic({
					        value: 0,
					        uuid: '2A07',
					        properties: ['read'],
					        onReadRequest: function (offset, callback) {
							console.log('TX Power.level read request:');
						        data = [0x0A];
						        var octets = new Uint8Array(data); 
							callback(this.RESULT_SUCCESS, octets);
						}
					})
				]
			}),
			//  proximity monitoring service
		        new bleno.PrimaryService({
		                uuid: '3E099910293F11E493BDAFD0FE6D1DFD',
		                characteristics: [
					// client proximity
					new bleno.Characteristic({
					        value: 0,
					        uuid: '3E099910293F11E493BDAFD0FE6D1DFD',
					        properties: ['writeWithoutResponse'],
					        onWriteRequest: function (data, offset, withoutResponse, callback) {
							console.log('proximity monitoring.client proximity WRITE:'+data[0]);
							this.value = data;
							var octets = new Uint8Array(data);
							console.log('0x'+u8AToHexString(octets).toUpperCase());
							var proximity_band = octets[0];
							var client_rssi = octets[1];
							client_rssi = (256 - client_rssi) * -1;
							if (proximity_band == 0) {
								console.log('Proximity Sharing is Off');
							} else {
								console.log('Client RSSI: '+client_rssi);
							}
							callback(this.RESULT_SUCCESS);
						}
					})
				]
			}),
			new bleno.PrimaryService({
				uuid: '1809',
				characteristics: [
					// temperature measurement
					new bleno.Characteristic({
					        value: 0,
					        uuid: '2A1C',
						properties: ['indicate'],
						onSubscribe: function (maxValueSize, updateValueCallback) { 
							console.log("subscribed to temperature measurement indications"); 
							simulateTemperatureSensor(updateValueCallback); 
						},
						// If the client unsubscribes, we stop broadcasting the message 
						onUnsubscribe: function () {
							console.log("unsubscribed from temperature measurement indications");
							clearInterval(temperature_timer); 
						}
					})
				]
			})
		]);
	}
});

bleno.on('servicesSet', function (error) {
	console.log('on -> servicesSet: ' + (error ? 'error ' + error : 'success'));
});


bleno .on('accept', function (clientAddress) {
	console.log('on -> accept, client: ' + clientAddress);
});

bleno.on('disconnect', function (clientAddress) { 
	console.log('Disconnected from address: ' + clientAddress);
	if (link_loss_alert_level > 0) {
		console.log('Alerting due to link loss');
	}
});

function u8AToHexString(u8a) {
	if (u8a == null) {
		return '';
	}
	hex = '';
	for (var i = 0; i < u8a.length; i++) {
		hex_pair = ('0' + u8a[i].toString(16)); 
		if (hex_pair.length == 3) {
			hex_pair = hex_pair.substring(1, 3);
		}
		hex = hex + hex_pair;
	}
	return hex.toUpperCase();
}

function simulateTemperatureSensor(updateValueCallback) {
	var celsius = 0.00;
	temperature_timer = setInterval(function () {
		celsius = celsius + 0.1;
		if (celsius > 100.0) {
			celsius = 0.00;
		}
		console.log("simulated temperature: " + celsius + "C");
		var celsius_times_10 = celsius * 10;
		var value = [0, 0, 0, 0, 0];
		// temperatures are in IEEE-11073 FLOAT format which consists of a single 
		// octet exponent followed by three octets comprising the mantissa. These 
		// 4 octets are in little endian format.
		value[4] = 0xFF; // exponent of -1
		value[3] = (celsius_times_10 >> 16);
		value[2] = (celsius_times_10 >> 8) & 0xFF;
		value[1] = celsius_times_10 & 0xFF;
		var buf = Buffer.from(value);
		updateValueCallback(buf);
	}, 1000);
}
