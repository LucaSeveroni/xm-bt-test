'use strict';

var app = {
    initialize: function () {
        this.bind();
    },
    bind: function () {
        document.addEventListener('deviceready', this.deviceready, false);
    },
    deviceready: function () {
        // note that this is an event handler so the scope is that of the event
        // so we need to call app.foo(), and not this.foo()

        // wire buttons to functions
        connectButton.ontouchstart = app.connect;
        listButton.ontouchend = app.list;
        listAgain.ontouchend = app.list;

        sendButton.ontouchstart = app.sendData;
        chatform.onsubmit = app.sendData;
        disconnectButton.ontouchstart = app.disconnect;

        // listen for messages
        bluetoothSerial.subscribe("\n", app.onmessage, app.generateFailureFunction("Subscribe Failed"));

        // get a list of peers
        //setTimeout(app.list, 2000);
    },
    list: function (event) {
        app.disable(listButton);
        app.disable(listAgain);
        deviceList.firstChild.innerHTML = "Ricerca...";
        app.setStatus("Ricerca dispositivi Bluetooth");
        bluetoothSerial.list(app.ondevicelist, app.generateFailureFunction("Errore ricerca dispositivi"));
    },
    connect: function () {
        var device = deviceList[deviceList.selectedIndex].value;
        app.disable(connectButton);
        app.setStatus("Connessione...");
        app.clean();
        console.log("Requesting connection to " + device);
        bluetoothSerial.connect(device, app.onconnect, app.ondisconnect);
    },
    disconnect: function (event) {
        if (event) {
            event.preventDefault();
        }
        app.clean();
        app.setStatus("Disconnessione...");
        bluetoothSerial.disconnect(app.ondisconnect);
    },
    sendData: function (event) {
        event.preventDefault();

        var data = new Uint8Array(1);
        switch(commands.selectedIndex) {
            case 0:
                data[0] = 0x11;
                break;
            case 1:
                data[0] = 0x12;
                break;
            case 2:
                data[0] = 0x13;
                break;
            case 3:
                data[0] = 0x21;
                break;
            case 4:
                data[0] = 0x22;
                break;
            case 5:
                data[0] = 0x23;
                break;
            case 6:
                data[0] = 0x31;
                break;
            case 7:
                data[0] = 0x32;
                break;
            case 8:
                data[0] = 0x33;
                break;
            case 9:
                data[0] = 0x34;
                break;
        }

        var success = function () {
            messages.value += ("Inviato: 0x" + data[0].toString(16) + "\n");
            messages.scrollTop = messages.scrollHeight;
        };

        bluetoothSerial.write(data, success);
        return false;
    },
    ondevicelist: function (devices) {
        var option;

        // remove existing devices
        deviceList.innerHTML = "";
        app.setStatus("");

        devices.forEach(function (device) {

            option = document.createElement('option');
            if (device.hasOwnProperty("uuid")) {
                option.value = device.uuid;
            } else if (device.hasOwnProperty("address")) {
                option.value = device.address;
            } else {
                option.value = "ERROR " + JSON.stringify(device);
            }
            option.innerHTML = device.name;
            deviceList.appendChild(option);
        });

        if (devices.length === 0) {

            option = document.createElement('option');
            option.innerHTML = "No Bluetooth Devices";
            deviceList.appendChild(option);

            if (cordova.platformId === "ios") { // BLE
                app.setStatus("Nessun perificerica Bluetooth trovata.");
            } else { // Android
                app.setStatus("Associare almeno un dispositivo bluetooth.");
            }

            app.disable(connectButton);
            listButton.style.display = "";
        } else {
            app.enable(connectButton);
            listButton.style.display = "none";
            app.setStatus("Trovat" + (devices.length === 1 ? "o " : "i ") + devices.length + " dispositiv" + (devices.length === 1 ? "o." : "i."));

            connection.style.display = "block";
        }

        app.enable(listButton);
        app.enable(listAgain);

    },
    onconnect: function () {
        connection.style.display = "none";
        chat.style.display = "block";
        app.setStatus("Connesso");
    },
    ondisconnect: function (reason) {
        var details = "";
        if (reason) {
            details += ": " + JSON.stringify(reason);
        }
        connection.style.display = "block";
        app.enable(connectButton);
        chat.style.display = "none";
        app.setStatus("Disconnesso");
    },
    onmessage: function (message) {
        messages.value += "Ricevuto: " + message;
        messages.scrollTop = messages.scrollHeight;
    },
    setStatus: function (message) { // setStatus
        console.log(message);

        window.clearTimeout(app.statusTimeout);
        statusMessage.innerHTML = message;
        statusMessage.className = 'fadein';

        // automatically clear the status with a timer
        app.statusTimeout = setTimeout(function () {
            statusMessage.className = 'fadeout';
        }, 5000);
    },
    enable: function (button) {
        button.className = button.className.replace(/\bis-disabled\b/g, '');
    },
    disable: function (button) {
        if (!button.className.match(/is-disabled/)) {
            button.className += " is-disabled";
        }
    },
    generateFailureFunction: function (message) {
        var func = function (reason) { // some failure callbacks pass a reason
            var details = "";
            if (reason) {
                details += ": " + JSON.stringify(reason);
            }
            app.setStatus(message + details);
        };
        return func;
    },
    clean: function () {
        messages.value = '';
        commands.selectedIndex = 0;
    }
};