'use strict';
const { app, BrowserWindow, ipcMain } = require('electron');
const { session } = require('electron');
const parseArgs = require('electron-args');
const fs = require('fs');
var logFile;
var window;

//==================== Exit(Error) code ======================== //
const INPUT_FILE_NOT_FOUND = 100;
const UNSUPPORT_INPUT_FILE_TYPE = 101;
const COOKIES_FILE_NOT_FOUND = 102;
const LOG_DIRECTORY_NOT_FOUND = 103;
const WRITE_LOG_SYNC_ERROR = 104;
//============================================================== //

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    event.preventDefault();
    callback(true);
});


const checkArgsAvailable = (cookies,logDir) => {
    if( typeof cookies == 'string' && !fs.existsSync(cookies)) {
      app.exit(COOKIES_FILE_NOT_FOUND);
    }

    if(typeof logDir == 'string' && logDir.length > 0) {
      if(!fs.existsSync(logDir)) {
        app.exit(LOG_DIRECTORY_NOT_FOUND);
      } else {
        makeLogFile(logDir);
      }
    }
}


const checkFileFormat = (input) => {
    var extensions = [".mhtml", ".mht", ".html", ".htm", ".xml"];
    for(var i = 0 ; i < extensions.length ; i++) {
      if(input.endsWith(extensions[i]))
        return true;
    }
    return false;
}


const makeLogFile = (logDir) => {
    var today = new Date();
    var month, date;
  
    if(!logDir.endsWith('/')) {
        logDir = logDir + "/";
    }

    if(today.getMonth() < 9) {
      month = "0" + (today.getMonth() + 1).toString();
    } else {
      month = (today.getMonth() + 1).toString();
    }
    
    if(today.getDate() <10) {
      date = "0" + today.getDate().toString();
    } else {
      date = today.getDate().toString();
    }
  
    logFile = logDir + today.getFullYear().toString() + month + date + today.getHours().toString() + today.getMinutes().toString() + "_log.txt";
}


const logging = (type,context) => {
    if(logFile) {
      try{
        var today = new Date();
        var timeStamp = today.getHours().toString() + "_" + today.getMinutes().toString() + "_" + today.getSeconds().toString() + " :: ";
        fs.appendFileSync(logFile, timeStamp + "[ " + type + " ] : " + context + "\n", {encoding: 'utf8'});
      }
      catch {
        app.exit(WRITE_LOG_SYNC_ERROR);
      }
    }
}


const insertCookies = (url, cookies) => {
}

const makeURLOption = (reqHeader) => {
}


const applyAttribute = (margin, header, footer) => {
    logging("INFO","Apply margin ###");
  
    logging("INFO","Apply Header : " + header);
  
    logging("INFO","Apply footer : " + footer);
};


const printToPdf = (filePath, margins, printBackground, landscape, pageSize, headerTemplate, footerTemplate, displayHeaderFooter, postCallback) => {
    logging("INFO","### start webContents.printToPDF() ###");
    // use 'window.webContents.printToPDF' function and convert web page as a fall-back data
    // And save data as file vias 'fs' module
    logging("INFO","### finish writePdf ###");
};


const printPage = (output, delay, margin, printBackground, landscape, header, footer, pageSize) => {
    // call applyAttribute() to set margin, header, footer, pageSize
    // check footer and header param to confirm displayHeaderFooter
    // set delayTime with delay param checking

    setTimeout(() => {
      // call printToPdf()
    }, delayTime);
}


const print = async (input, output, cookies, requestHeader, delay, timeout, margin, printBackground, landscape, header, footer, pageSize, debugMode) => {
    logging("INFO","### Start printPage ### --input : " + input + "\t --output : " + output + "\n\t --cookies : " + cookies
            + "\t --request Header : " + requestHeader + "\t --header : " + header + "\t --footer : " + footer);
  
    window = new BrowserWindow({
      autoHideMenuBar: true,
      show: false,
      webPreferences: {
        javascript: true,
        nodeIntegration: true,
        webSecurity: false,
        allowDisplayingInsecureContent: true,
        allowRunningInsecureContent: true,
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true
      }
    });

    // TODO:
    // 1. set debugMode
    // 2. set timeout
    // 3. define 'did-finish-load' event to call printPage
    // 4. call load function with set cookie and header via follow functions
    //  4 - 1. load local File : window.loadFile()
    //  4 - 2. make header : makeURLOption()
    //  4 - 3. load url : window.loadURL()
}

app.on('ready', () => {
    const arg = parseArgs(`webConvertor : ${require('./version')}
    require:
      --input=Input URL or local file path
      --output=Result PDF File path
    optional:
      --delay=[millisecond]
          Wait this time after the page loads. 
      --printBackground
      --footer=[some text]
      --header=[some text]
      --landscape
      --margin=[no-margin|minimum|n,n,n,n]
      --timeout=[millisecond]
      --pageSize=[A4|A3 ...]
      --cookies=[json file path]
      --requestHeader=[Text file path]
        Text Format:key:value
                    key:value
                    ...
      --logDir=[log directory]
    `, {
      alias: {
        h: 'help',
        i: 'input',
        o: 'output',
        d: 'delay',
        t: 'timeout',
        m: 'margin',
      }
    });
    
    const input = arg.flags.input;
    const output = arg.flags.output;
    const cookies = arg.flags.cookies;
    const requestHeader = arg.flags.requestHeader;
    const delay = arg.flags.delay;
    const timeout = arg.flags.timeout;
    const margin = arg.flags.margin;
    const printBackground = arg.flags.printBackground;
    const landscape = arg.flags.landscape;
    const header = arg.flags.header;
    const footer = arg.flags.footer;
    const pageSize = arg.flags.pageSize;
    const debugMode = arg.flags.debugMode;
    const logDir = arg.flags.logDir;
    if (typeof input != 'string' || typeof output != 'string') {
      arg.showHelp(-1);
    } else {
      checkArgsAvailable(input,cookies,logDir);
      print(input, output, cookies, requestHeader, delay, timeout, margin, printBackground, landscape, header, footer, pageSize, debugMode);
    }
});