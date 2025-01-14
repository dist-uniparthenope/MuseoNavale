const observableModule = require("tns-core-modules/data/observable");
let fs = require("tns-core-modules/file-system");
let Observable = require("tns-core-modules/data/observable");
let ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const appSetting = require("tns-core-modules/application-settings");
let stringSimilarity = require('string-similarity');
let Fresco = require("nativescript-fresco");
let device = require("tns-core-modules/platform");

let items;
let viewModel;
let page;
let myItems = new ObservableArray();

exports.onNavigatingTo = function(args) {
    page = args.object;

    items = new ObservableArray();

    viewModel = observableModule.fromObject({
        items:items
    });

    if (device.isAndroid)
        Fresco.initialize();

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
                    "other_image": jsonData['items'][i]['field_other_image'],
                    "audio": jsonData['items'][i]['field_audio'],
                    "description": jsonData['items'][i]['body']
                });
            }
            else{
                items.push({
                    "id": jsonData['items'][i]['nid'],
                    "image": documents.getFile("images/no_image.png").path,
                    "title": title,
                    "other_image": "",
                    "audio": jsonData['items'][i]['field_audio']
                });
            }
        }
    });

    if (page.get("search_text") !== "")
        page.set("search_text", "");

    page.bindingContext = viewModel;
}

exports.onTextViewLoaded = function(args) {
    const textView = args.object;

    textView.on("textChange", (args) => {
        console.dir(args.value);
        myItems.splice(0);

        if(args.value !== "") {
            for(let i = 0; i < items.length; i++) {
                let similarity = stringSimilarity.compareTwoStrings(args.value, items.getItem(i).title);
                if (similarity > 0.2) {
                    myItems.push(items.getItem(i));
                }
            }
            viewModel.set("items", myItems);
        }
        else {
            viewModel.set("items", items);
        }
    });
}

exports.onTap = function(args) {
    const index = args.index;

    let temp = new ObservableArray();

    if(myItems.length !== 0)
        temp.push(myItems.getItem(index));
    else
        temp.push(items.getItem(index));

    const nav =
        {
            moduleName: "detail/detail-page",
            context: {
                data: temp.getItem(0)
            }
        };

    page.frame.navigate(nav);
}
