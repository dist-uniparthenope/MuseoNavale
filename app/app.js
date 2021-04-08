const application = require("tns-core-modules/application");
let device = require("tns-core-modules/platform");
require('globals');
require('nativescript-i18n');

let domain = "http://museonavale.uniparthenope.it:5000";
/*
let domain;
if(device.isAndroid){
     domain = "http://10.0.2.2:5000";
}
else{
    domain = "http://127.0.0.1:5000";
}
 */
global.url = domain;

application.run({ moduleName: "app-root" });
