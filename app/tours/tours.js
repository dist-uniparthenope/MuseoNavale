const observableModule = require("tns-core-modules/data/observable");
let fs = require("tns-core-modules/file-system");
let Observable = require("tns-core-modules/data/observable");
let ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const appSetting = require("tns-core-modules/application-settings");

let viewModel;
let page;
let items;

exports.onNavigatingTo = function(args) {
    page = args.object;

    items = new ObservableArray();

    viewModel = observableModule.fromObject({
        items:items
    });

    let documents = fs.knownFolders.documents();
    let url_main = documents.getFolder("/assets/zip/file/MuseoNavale");
    let fileJson = url_main.getFile(appSetting.getString("fileJson"));
    fileJson.readText().then(function (data) {
        let jsonData = JSON.parse(data);
        for(let i=0; i<jsonData['tours'].length; i++){
            items.push({
                "id": jsonData['tours'][i]['tour'],
                "image": "~/images/tour_complete.png"
            });
        }
    });

    page.bindingContext = viewModel;
}

exports.onTap = function(args) {
    const index = args.index;

    let temp = new ObservableArray();

    temp.push(items.getItem(index));

    const nav =
        {
            moduleName: "tour/tour",
            context: {
                data: temp.getItem(0),
                index: index
            }
        };

    page.frame.navigate(nav);
}
