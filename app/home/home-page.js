const observableModule = require("tns-core-modules/data/observable");
let fs = require("tns-core-modules/file-system");
let device = require("tns-core-modules/platform");
let ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const appSetting = require("tns-core-modules/application-settings");
let BarcodeScanner = require("nativescript-barcodescanner").BarcodeScanner;
let barcodescanner = new BarcodeScanner();

let viewModel;
let page;
let items;

exports.onNavigatingTo = function(args) {
    page = args.object;

    items = new ObservableArray();

    viewModel = observableModule.fromObject({
        items:items
    });
    if(device.isIOS)
        page.enableSwipeBackNavigation = false;

    let documents = fs.knownFolders.documents();

    console.log("exists");
    let url_main = documents.getFolder("/assets/zip/file/MuseoNavale");
    let fileJson = url_main.getFile(appSetting.getString("fileJson"));
    fileJson.readText().then(function (data) {
        let jsonData = JSON.parse(data);
        for (let i = 0; i < jsonData['items'].length; i++) {
            let img_name = jsonData['items'][i]['field_image'];
            let path_img = url_main.path + "/" +img_name;
            let title = jsonData['items'][i]['title'];

            if(img_name !== "") {
                items.push({
                    "id": jsonData['items'][i]['nid'],
                    "image": path_img,
                    "title": title,
                    "description": jsonData['items'][i]['field_description'],
                    "other_image": jsonData['items'][i]['field_other_image'],
                    "audio": jsonData['items'][i]['field_audio']
                });
            }
            else{
                items.push({
                    "id": jsonData['items'][i]['nid'],
                    "image": documents.getFile("images/no_image.png").path,
                    "title": title,
                    "description": jsonData['items'][i]['field_description'],
                    "other_image": "",
                    "audio": jsonData['items'][i]['field_audio']
                });
            }
        }
    });

    page.bindingContext = viewModel;
}

exports.QRCode = function(){
    barcodescanner.hasCameraPermission().then(permitted => {
        if(permitted)
            scan();
        else{
            barcodescanner.requestCameraPermission().then(
                function () {
                    console.log("Camera permission requested");

                    scan();
                });
        }
    }, (err) => {
        alert(err);
    });
}

function scan(){
    barcodescanner.scan({
        formats: "QR_CODE",
        cancelLabelBackgroundColor: "#333333", // iOS only, default '#000000' (black)
        message: "Scansiona un QR-Code per i dettagli sull'oggetto.", // Android only, default is 'Place a barcode inside the viewfinder rectangle to scan it.'
        preferFrontCamera: false,     // Android only, default false
        showFlipCameraButton: false,   // default false
        showTorchButton: false,       // iOS only, default false
        torchOn: false,               // launch with the flashlight on (default false)
        resultDisplayDuration: 500,   // Android only, default 1500 (ms), set to 0 to disable echoing the scanned text
        beepOnScan: true,             // Play or Suppress beep on scan (default true)
        orientation: "portrait",
        openSettingsIfPermissionWasPreviouslyDenied: true, // On iOS you can send the user to the settings app if access was previously denied
        closeCallback: () => {
            console.log("Scanner closed @ " + new Date().getTime());
        }
    }).then(
        function (result) {
            console.log("--- scanned: " + result.text);
            // Note that this Promise is never invoked when a 'continuousScanCallback' function is provided
            setTimeout(function () {
                console.log(result.text);
                let found = false;
                let temp = new ObservableArray();
                for(let i=0; i<items.length; i++) {
                    if(items.getItem(i).id === result.text){
                        found = true;
                        temp.push(items.getItem(i));
                        break;
                    }
                }
                if(found){
                    const nav =
                        {
                            moduleName: "detail/detail-page",
                            context: {
                                data: temp.getItem(0)
                            }
                        };

                    page.frame.navigate(nav);
                }
                else{
                    alert({
                        title: "Errore",
                        message: "Nessun elemento trovato corrispondente a questo QR-CODE",
                        okButtonText: "OK"
                    });
                }
            }, 500);

        },
        function (errorMessage) {
            console.log("No scan. " + errorMessage);
        }
    );
}

exports.about = function() {
    page.frame.navigate("info/info");
}

exports.rooms = function(){
    page.frame.navigate("rooms/rooms");
}

exports.explore = function(){
    page.frame.navigate("explore/explore");
}

exports.tour = function(){
    page.frame.navigate("tours/tours");
}

exports.info = function(){
    page.frame.navigate("museo/museo");
}
