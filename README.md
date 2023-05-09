# WebConvertor

## What is WebConvetor
To convert a traditional web page to PDF, you had to rely on the user to view the page with a viewer and convert it to PDF directly.  
**This project provides Web To PDF conversion via CLI.**
<hr/>

## Build
[npm(Node js)](https://nodejs.org/en/) is required to use webConvertor.  
1. Be sure to run npm install first  
2. Enter the command below when testing webConvertor  
  npm start -- {args...}
3. When deploying the webConvertor binary, enter the command below  
  npm run build:windows
4. Unified build command  
  build.py  

If the error below is displayed, run npm install because number 1 is omitted.  
- Ex) npm ERR! Failed at the webConvertor@0.0.1 start script 'electron .'.
<hr/>

## Usage
> basic command example
```shell
webconvertor.exe --input="{inputFile/URL}" --output="{outputFile}"
```

> Offering options
- **delay=[millisecond]**  
  Wait this time after the page loads.
- **printBackground(Switch option)**  
  same As brintBackground option on Chrome.  
  default : true
- **footer=[some text]**   
  Insert some string on bottom of page.
- **header=[some text]**  
  Insert some string on top of page.
- **landscape(Switch option)**  
  Set the rotation direction of the page.  
  defalut : false
- **margin=[no-margin[minimum[n,n,n,n]**  
  Set top, bottom, left and right margins.
- **timeout=[millisecond]**  
  Set conversion time timeout.
- **pageSize=[A4|A3 ...]**  
  Set paper size.
- **cookies="json file path"**  
  Json file path for cookie settings.  
  - json file example  
  ```json
  {
    "cookies" :
    [
        {
            "url"   : "https://google.com/",
            "name"  : "hyunwooKoh",
            "value" : "testValue",
            "domain"    : "localhost",
            "path"      : "/",
            "expirationDate" :1814157005,
            "secure" : false,
            "httpOnly" : false
        }
    ]
  }
  ```
- **requestHeader="text file path"**  
  Text file path for header configuration  
  - text file example  
  ```text
  testkey1:testValue1
  testkey2:testValue2
  testkey3:testValue3
  ```
- **logDir="log directory"**  
  Log directory path
- **debugMode(Switch option)**  
  Launch application with debugging console.  
  default : false
<br/>

> Full command example
```shell
webconvertor.exe --input="https://www.google.com/" --output="/home/user/convert/test.pdf" --printBackground --landscape --header="headerString" --footer="footerString" --margin=[10,10,15,15] --pageSize=A4 --cookies="/home/user/convert/cookie.json" --requestHeader="/home/user/convert/header.txt" --logDir="/home/user/convert/log/" --debugMode 
```