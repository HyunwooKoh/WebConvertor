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
const APP_TIMEOUT = 105;
//============================================================== //

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    event.preventDefault();
    callback(true);
});


const checkArgsAvailable = (input, cookies,logDir) => {
  if( typeof input == 'string' && !fs.existsSync(input)) {
    app.exit(INPUT_FILE_NOT_FOUND);
  }

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
    } catch {
      app.exit(WRITE_LOG_SYNC_ERROR);
    }
  }
}


const insertCookies = (url, cookies) => {
  if( typeof cookies == 'string' && cookies.length > 0) {
    const cookieFile = fs.readFileSync(cookies);
    if(cookieFile) {
      const cookieData = JSON.parse(cookieFile.toString());
      logging("INFO", "cookies file size : " + Object.keys(cookieData.cookies).length.toString() + " cookieFile.toString() : " + cookieFile.toString());
      for(var i = 0 ; i < Object.keys(cookieData.cookies).length; i++) {
        const cookie = {
          url : url,
          name : cookieData.cookies[i].name,
          value : cookieData.cookies[i].value,
          expirationDate : new Date().getTime() + 60000, //Set Expiration Sec Here.
          path : cookieData.cookies[i].path != undefined ? cookieData.cookies[i].path : ""
        }
        session.defaultSession.cookies.set(cookie , function(error) {
          if(error)
            logging("ERROR","Insert Cookie Error, error : " + error);
        });
      }
    }
  }
}


const makeURLOption = (reqHeader) => {
  let header = {
    extraHeaders : fs.readFileSync(reqHeader).toString()
  }
  return header;
}


const applyAttribute = (margin, header, footer) => {
  let margins = {};
  let headerTemplate = '<span></span>';
  let footerTemplate = '<span></span>';

  logging("INFO","### Start writePdf ###");
  window.webContents.executeJavaScript(`const createStyleSheet = () => {
    const styleEl = document.createElement('style');
    document.head.appendChild(styleEl);
    return styleEl.sheet;
  };`);

  logging("INFO","### After 1st js execute ###");
  window.webContents.executeJavaScript(`const appendPrintDiv = (name, contents) => {
    const elem = document.createElement('div');
    elem.className = name;
    elem.innerText = contents;
    document.body.appendChild(elem);
  };`);

  logging("INFO","### Before Set margin ###");
  if (margin === undefined || margin === 'default') {
    // 크롬에서 PDF로 저장할 때 여백을 기본값으로 저장하게되면, PDF에 여백이 특수하게 부여됩니다.
    // 그 값은 top, left = 29.00004 pt 그리고 bottom, right = 28.000042 pt 로 부여됩니다.
    // 따라 두 포인트를 인치로 전환하여 아래 입력합니다.
    const defaultMarginLT = 0.40277833333; 
    const defaultMarginRB = 0.388889472222;
    margins = {"top":defaultMarginLT,"bottom":defaultMarginRB,"right":defaultMarginRB,"left":defaultMarginLT};
  } else if (margin === 'no-margin' || margin === 'minimum') {
    margins = {"top":0,"bottom":0,"right":0,"left":0};
  } else if (margin.split(',').length === 4) {
    const margins_key_list = ["top", "bottom", "right", "left"];
    margins = margins_key_list.reduce((acc, val, idx) => ({ ... acc, [val]: margin_array[idx]/25.4}), {});    // 사용자 input은 mm지만 이를 inch로 변환해야함(mm / 25.4 --> inch)
  }
  logging("INFO","### After Set margin ###");

  if (header !== undefined) {
    logging("INFO","Apply Header : " + header);
    headerTemplate = '<span style="font-size:10px; margin-left:25px;">'+header+'</span>';
  }

  if (footer !== undefined) {
    logging("INFO","Apply footer : " + footer);
    footerTemplate = '<span style="font-size:10px; margin-left:25px;">'+footer+'</span>';
  }
  return [margins, headerTemplate, footerTemplate];
};


const printToPdf = (filePath, margins, printBackground, landscape, pageSize, headerTemplate, footerTemplate, displayHeaderFooter, postCallback) => {
  logging("INFO","### start webContents.printToPDF() ###");
  window.webContents.printToPDF({
    margins: margins,
    printBackground: printBackground,
    landscape: landscape,
    pageSize: pageSize,
    displayHeaderFooter: displayHeaderFooter,
    headerTemplate: headerTemplate,
    footerTemplate: footerTemplate
  }).then(data => {
    logging("INFO","filePath : " + filePath);
    require('fs').writeFile(filePath, data, () => {
      if (typeof postCallback === 'function') {
        postCallback();
      }
    }); 
  }).catch(error => {
    logging(`Failed to write PDF: `, error)
  })
  logging("INFO","### finish writePdf ###");
};


const printPage = (output, delay, margin, printBackground, landscape, header, footer, pageSize) => {
  let return_data = applyAttribute(margin, header, footer, pageSize);
  let margins = return_data[0];
  let headerTemplate = return_data[1];
  let footerTemplate = return_data[2];
  let displayHeaderFooter = false;
  
  if (header !== undefined || footer !== undefined) {
    displayHeaderFooter = true;
  }

  if (margins === -1) app.exit(MARGIN_OVER_PAGESIZE);
  let delayTime = (delay === undefined || delay === 0) ? 
    (margin === undefined && footer === undefined && header === undefined) ? 0 : 100 
    : delay;
  
  if(delay !== delayTime) {
    logging("INFO","Set delay time " + delay + " to " + delayTime + "for apply attribute");
  }

  setTimeout(() => {
    printToPdf(output, margins, printBackground, landscape, pageSize, headerTemplate, footerTemplate, displayHeaderFooter, () => app.exit(0));
  }, delayTime); // To Set Attribute on Web, we need tick!
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
  if (debugMode === true) {
    window.show();
    window.webContents.openDevTools();
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