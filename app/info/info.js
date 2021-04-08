const Observable = require("tns-core-modules/data/observable");
var utilityModule = require("tns-core-modules/utils/utils");
var appversion = require("nativescript-appversion");

exports.pageLoaded = function(args) {
    const page = args.object;
    const info = new Observable.fromObject({});
    appversion.getVersionName().then(function(v) {
        console.log(v);
        info.set("version", v);
    });

    page.bindingContext = info;
}

exports.web = function() {
    utilityModule.openUrl("https://museonavale.uniparthenope.it");
}
