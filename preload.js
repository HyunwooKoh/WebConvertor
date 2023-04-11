const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
    "API", {
        requestPrint : () => ipcRenderer.send('reqPrint'),
        test : () => "API TEST"
    }
);


