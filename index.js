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
  // 입력받은 cookie 파일을 읽어 JSON 모듈로 파싱
	// 데이터의 key를 순회하며 cookie 객체 생성
	// cookie 객체 : (url, name, value, expirationDate, path)
	// 각 json key 별로 생성한 cookie 객체를 electron 모듈의 
	// defaultSession.cookies.set(cookei)와 같이 세팅
	// cookie 설정 중 오류가 발생한 경우, 별도의 종료 프로세스 없이 계속 진행

}

const makeURLOption = (reqHeader) => {
  // reqHeader 경로의 header파일 (txt)를 읽어 이를 string화
	// retrun headerString
}


const applyAttribute = (margin, header, footer) => {
// if margin !== undefined 인 경우 margin 세팅 진행
//   입력받은 margin(string)을 split(‘,’) 하여 top, bottom, right, left 순서 별로
//   저장 및 각각의 값을 margin/25.4 연산을 통해 mm에서 inch로 변환
// if header !== undefined 인 경우 header 세팅을 위한 템플릿 생성
//   ‘<span style=“font-size:10px; margin-left:25px;”>’ + header + ‘</span>’
// if footer !== undefined 인 경우 footer 세팅을 위한 템플릿 생성
//   ‘<span style=“font-size:10px; margin-left:25px;”>’ + footer + ‘</span>’
// 설정한 pageSize에 margin을 문제 없이 설정할 수 있는지 검증
// 위에서 생성한 객체들을 list에 담아서 return
// return [margins, headerTemplate, footerTemplate, pageSize]
  logging("INFO","Apply margin ###");
  logging("INFO","Apply Header : " + header);
  logging("INFO","Apply footer : " + footer);
};


const printToPdf = (filePath, margins, printBackground, landscape, pageSize, headerTemplate, footerTemplate, displayHeaderFooter, postCallback) => {
  // 전달받은 파라미터를 사용하여 변환 진행
	// postCallback() 함수는 printPage에서 () => app.exit(0)를 전달
	// window.webContents.printToPDF({
	// 	margins : margins,
	// 	printBackground : printBackground,
	// 	landscape : landscape,
	// 	pageSize : pageSize,
	// 	displayHeaderFooter : displayHeaderFooter,
	// 	headerTemplate : headerTemplate,
	// 	footerTemplate : footerTemplate}).then(data=> {
	// callback 부분에서 ‘fs’모듈을 통해 로컬에 파일로 저장 및 넘겨받은 callback 
	// 함수 호출
	//   fs.writeFile(filePath, data, () => {postCallback();})
	logging("INFO","### start webContents.printToPDF() ###");
  logging("INFO","### finish writePdf ###");
};


const printPage = (output, delay, margin, printBackground, landscape, header, footer, pageSize) => {
  // print(...)에서 ‘did-finish-load’ 콜백 시 호출되는 함수
	// attr_data = applyAttribute(margin, header, footer, pageSize)
	// header나 footer가 정의된 경우 displayHeaderFooter 플래그 on
	// delay가 있거나, footer, header 및 margin 중 하나라도 설정된 경우
	//   delayTime을 설정 (기본값 100ms -> footer 등의 attr 설정 시간)
	// setTimeout(printToPdf(..), delayTime) 으로 delay를 준 후 printToPdf(...)
	//   함수에서 실제 변환 진행
  //   setTimeout(() => {
  //     // call printToPdf()
  //   }, delayTime);
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