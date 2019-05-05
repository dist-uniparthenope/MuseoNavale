const observableModule = require("tns-core-modules/data/observable");
let Observable = require("tns-core-modules/data/observable");
let ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
let fs = require("tns-core-modules/file-system");
const appSetting = require("tns-core-modules/application-settings");
let platformModule = require("tns-core-modules/platform");
var phone = require( "nativescript-phone" );
var utilityModule = require("tns-core-modules/utils/utils");

let viewModel;
let page;
let items;

function onNavigatingTo(args) {
    page = args.object;

    items = new ObservableArray();

    viewModel = observableModule.fromObject({
        items:items
    });

    viewModel.set("telephon_number", "0815475417");

    let data = new Date();

    let documents = fs.knownFolders.currentApp();
    let url_main = documents.getFolder("/assets/zip/file/MuseoNavale");
    let fileJson = url_main.getFile(appSetting.getString("fileJson"));
    fileJson.readText().then(function (data1) {
        let jsonData = JSON.parse(data1);
        viewModel.set("altezza", jsonData['orari'].length * 20);

        if(jsonData['orari'][data.getDay()-1]["orari"][0]["apertura"] != "N/A")
        {
            if(data.getHours() < jsonData['orari'][data.getDay()-1]["orari"][0]["apertura"] || data.getHours() > jsonData['orari'][data.getDay()-1]["orari"][0]["chiusura"]){
                viewModel.set("apertura", "- Chiuso -");
            }
            else{
                viewModel.set("apertura", "- Aperto -");
            }
        }
        else{
            viewModel.set("apertura", "- Chiuso -");
        }

        for(let i=0; i<jsonData['orari'].length; i++){

            if(jsonData['orari'][i]["orari"][0]["apertura"] != "N/A"){
                items.push({
                    "giorno": jsonData["orari"][i]["giorno"],
                    "min" : jsonData["orari"][i]["orari"][0]["apertura"] + ":00 - ",
                    "max" : jsonData["orari"][i]["orari"][0]["chiusura"] + ":00"
                });
            }
            else{
                items.push({
                    "giorno": jsonData["orari"][i]["giorno"],
                    "min" : "Chiuso",
                    "max": ""
                });
            }
        }
    });

    page.bindingContext = viewModel;
}

function openPhone(){
    let number = viewModel.get("telephon_number");
    phone.dial(number, true);
}

function web() {
    utilityModule.openUrl("https://museonavale.uniparthenope.it");
}

exports.web = web;
exports.openPhone = openPhone;
exports.onNavigatingTo = onNavigatingTo;