const observableModule = require("tns-core-modules/data/observable");
let fs = require("tns-core-modules/file-system");
let Observable = require("tns-core-modules/data/observable");
let ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const appSetting = require("tns-core-modules/application-settings");
let Fresco = require("nativescript-fresco");
let device = require("tns-core-modules/platform");

let viewModel;
let page;
let items;
let data = new ObservableArray();
let index;

exports.onNavigatingTo = function(args) {
    page = args.object;

    items = new ObservableArray();

    viewModel = observableModule.fromObject({
        items:items
    });

    if (device.isAndroid)
        Fresco.initialize();

    data = page.navigationContext.data;
    index = page.navigationContext.index;
    viewModel.set("titolo", data.id);

    let documents = fs.knownFolders.documents();
    let url_main = documents.getFolder("/assets/zip/file/MuseoNavale");
    console.log(url_main);
    let fileJson = url_main.getFile(appSetting.getString("fileJson"));
    fileJson.readText().then(function (data1) {
        let jsonData = JSON.parse(data1);
        for(let j=0; j<jsonData['rooms'][index]['items'].length; j++){
            let img_name = jsonData['rooms'][index]['items'][j]['field_image'];
            let path_img = url_main.path + "/" +img_name;

            console.log(jsonData['rooms'][index]['items'][j]['title']);

            if(img_name !== ""){
                items.push({
                    "id" : jsonData['rooms'][index]['items'][j]['nid'],
                    "title": jsonData['rooms'][index]['items'][j]['title'],
                    "image": path_img,
                    "other_image": jsonData['rooms'][index]['items'][j]['field_other_image'],
                    "audio": jsonData['rooms'][index]['items'][j]['field_audio'],
                    "number_tour" : jsonData['rooms'][index]['items'][j]['field_number_tour'],
                    "description": jsonData['rooms'][index]['items'][j]['body']
                });
            }
            else{
                items.push({
                    "id" : jsonData['rooms'][index]['items'][j]['nid'],
                    "title" : jsonData['rooms'][index]['items'][j]['title'],
                    "image": documents.getFile("images/no_image.png").path,
                    "other_image": "",
                    "audio": jsonData['rooms'][index]['items'][j]['field_audio'],
                    "number_tour" : jsonData['rooms'][index]['items'][j]['field_number_tour'],
                    "description": jsonData['rooms'][index]['items'][j]['body']
                })
            }

            items.sort(function (orderA, orderB) {
                let dataA = (parseInt(orderA.number_tour));
                let dataB = (parseInt(orderB.number_tour));

                return (dataA < dataB) ? -1 : (dataA > dataB) ? 1 : 0;
            });
        }
    });

    page.bindingContext = viewModel;
}

exports.onTap = function(args) {
    const index = args.index;

    let all_items = new ObservableArray();
    for(let i=0; i<items.length; i++)
        all_items.push(items.getItem(i));

    const nav =
        {
            moduleName: "detail/detail-page",
            context: {
                all_items: all_items,
                index: index,
                page: "room"
            }
        };

    page.frame.navigate(nav);
}
