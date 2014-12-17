/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

    currentDevice: '',
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.receivedEvent('deviceready');

        btn_onnect.ontouchstart = app.connectToDevice();

        try {
            bluetoothSerial.isEnabled(
		        function () {
		            app.subscribeToDevice();
		            app.scanForDevices();
		        },
		        function () {
		            alert("Bluetooth *NON* abilitato");
		        }
	        );
        } catch (e) {
            alert(e);
        }

    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        
    },
    scanForDevices: function () {
        bluetoothSerial.list(
            function (results) {
                
                for (var i = 0; i < results.length; i++) {
                    container.innerHTML += '<option value=\"' + results[i].address + '\">' + results[i].name + '</option>';// button type="button" onclick="app.connectToDevice(\'' + + '\');">Connect</button></div><br />';
                    btnConnect.disabled = false;
                }

                if (results.length == 0) {
                    container.innerHTML += '<option value=\"">Nessun dispositivo trovato</option>';
                    container.disabled = true;
                    btnConnect.disabled = true;
                }
            },
            function (error) {
                alert(JSON.stringify(error));
            }
        );
    },
    connect: function () {
        currentDevice = deviceList[devices.selectedIndex].value;
        //app.disable(connectButton);
        //app.setStatus("Connecting...");
        //console.log("Requesting connection to " + device);
        bluetoothSerial.connect(currentDevice, app.onconnect, app.ondisconnect);
    },
    disconnect: function (event) {
        if (event) {
            event.preventDefault();
        }

        //app.setStatus("Disconnecting...");
        bluetoothSerial.disconnect(app.ondisconnect);
    },
    onconnect: function () {
        /*connection.style.display = "none";
        chat.style.display = "block";
        app.setStatus("Connected");*/
        alert('Connected');
    },
    ondisconnect: function (reason) {
        var details = "";
        if (reason) {
            details += ": " + JSON.stringify(reason);
        }
       /* connection.style.display = "block";
        app.enable(connectButton);
        chat.style.display = "none";
        app.setStatus("Disconnected");*/
        alert('Disconnected');
    },
    subscribeToDevice: function () {
        bluetoothSerial.subscribeRawData(
            function (data) {
                var bytes = new Uint8Array(data);
                alert(bytes);
            },
            function () {
                alert('Subscription error');
            }
        );
        /*bluetoothSerial.subscribe(
            "\n",
             function () {
                 alert('Subscription OK')
             },
             function () {
                 alert("Subscribe Failed")
             }
        );*/
    },
    writeData: function () {
        var data = new Uint8Array(1);
        data[0] = 0x11;
        bluetoothSerial.write(
            data,
            function () {
                alert('Dati inviati correttamente');
            },
            function () {
                alert('Errore invio dati');
            });
    }

};
