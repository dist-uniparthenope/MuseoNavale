const observableModule = require("tns-core-modules/data/observable");
let native_zip = require("nativescript-zip").Zip;
let fs = require("tns-core-modules/file-system");
const httpModule = require("tns-core-modules/http");
let appSetting = require("tns-core-modules/application-settings");
let DownloaderManager = require("nativescript-downloadmanager").DownloadManager;
let device = require("tns-core-modules/platform");

let view;
let viewModel;
let page;

exports.onNavigatingTo = function(args) {
    page = args.object;

    viewModel = observableModule.fromObject({});

    view = page.getViewById("toRotate");
    /*view.animate({
        rotate : 360,
        duration : 2000,
        iterations : Number.POSITIVE_INFINITY
    });*/

    if(appSetting.getString("update", "NO") === "YES"){
        appSetting.setString("update", "NO");
        fs.knownFolders.currentApp().getFolder("/assets/zip").remove();
        download_and_zip();
    }
    else{
        if(!fs.Folder.exists(fs.knownFolders.currentApp().path + "/assets/zip")) {
            download_and_zip();
        }
        else{
            const navigationEntry = {
                moduleName: "intro/intro",
                clearHistory: true
            };
            page.frame.navigate(navigationEntry);
        }
    }

    page.bindingContext = viewModel;
}

function download_and_zip() {
    console.log('Download Started');
    viewModel.set("loading", "Downloading.....");
    let folder = fs.knownFolders.currentApp();
    let file = fs.path.join(folder.path, "/assets/zip/prova.zip");
    let dest = fs.path.join(fs.knownFolders.currentApp().path, "/assets/zip");
    console.log(file);
    console.log(dest);

    let url = global.url + "/boundle";

    httpModule.getFile(url, file).then(function () {
        console.log("Download complete", file);

        native_zip.unzip({archive: file, directory: dest, onProgress: onZipProgress}).then(() => {
            console.log('unzip succesfully completed');

            let url_main = folder.getFolder("/assets/zip/file/MuseoNavale");
            url_main.getEntities().then(function (data) {
                for (let i = 0; i < data.length; i++) {
                    let name = data[i]["_name"];

                    if (url_main.getFile(name).extension === ".json") {
                        appSetting.setString("fileJson", name);

                        if (device.isAndroid){
                            let _file = fs.File.fromPath(file);
                            _file.remove();
                        }
                        else{
                            fs.knownFolders.currentApp().getFile("/assets/zip/prova.zip").remove();
                        }

                        console.log("Remove");
                        page.frame.navigate("home/home-page");
                    }
                }
            });
        }).catch(err => {
            console.log('unzip error: ' + err);
            if (device.isAndroid){
                let file = fs.File.fromPath(file);
                file.remove();
            }
            else{
                fs.knownFolders.currentApp().getFile("/assets/zip/prova.zip").remove();
            }
            page.frame.navigate("intro/intro");

            const navigationEntry = {
                moduleName: "intro/intro",
                clearHistory: true
            };
            page.frame.navigate(navigationEntry);
        });
        /*
        native_zip.unzipWithProgress(file, dest, onZipProgress, true).then(() => {
                console.log('unzip succesfully completed');

                let url_main = folder.getFolder("/assets/zip/file/MuseoNavale");
                url_main.getEntities().then(function (data) {
                    for (let i = 1; i < data.length; i++) {
                        let name = data[i]["_name"];

                        if (url_main.getFile(name).extension === ".json") {
                            appSetting.setString("fileJson", name);
                            fs.knownFolders.currentApp().getFile("/assets/zip/prova.zip").remove();
                            console.log("Remove");
                            page.frame.navigate("home/home-page");
                        }
                    }
                });
            })
            .catch(err => {
                console.log('unzip error: ' + err);
                fs.knownFolders.currentApp().getFolder("/assets/zip").remove();
                page.frame.navigate("intro/intro");

                const navigationEntry = {
                    moduleName: "intro/intro",
                    clearHistory: true
                };
                page.frame.navigate(navigationEntry);
            });

         */
    },function (e) {
        console.log(e);
        const navigationEntry = {
            moduleName: "intro/intro",
            clearHistory: true
        };
        page.frame.navigate(navigationEntry);
    });
}


function onZipProgress(args) {
    //console.log('unzipping:' + args + "%");
    viewModel.set("loading", "Unzipping: " + args + " %");
}
