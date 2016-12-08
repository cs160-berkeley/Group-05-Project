import Pins from "pins";

import { // Imports for button behavior
    Button,
    ButtonBehavior
} from 'buttons';

import {
   VerticalScroller,
   VerticalScrollbar,
   TopScrollerShadow,
   BottomScrollerShadow
} from 'scroller';

let textStyle = new Style({ font: "30px Lato", color: "white" });
let comicStyle = new Style({ font: "18px Lato", color: "black" });
let smallStyle = new Style({ font: "16px Lato", color: "white" });
let largeWhite = new Style({ font: "22px Lato", color: "white" });
let smallerComicStyle = new Style({ font: "16px Lato", color: "black" });
let transparentSkin = new Skin({ fill : "transparent" });

var odd = true;
var currentContainer = "Avocados";
var globalStatus = "unlocked";
var allFoodContainers;

// Reusable button template for the app
let buttonTemplate = Button.template($ => ({
    top: $.top, bottom: $.bottom, left: $.left, right: $.right, skin: $.skin,
    contents: [
        Label($, { name: $.name , top: 0, bottom: 0, left: 0, right: 0, style: $.style, string: $.text })
    ],
    Behavior: class extends ButtonBehavior {
        onTap(button){
            buttonOnTap($.action);
        }
    }
}));

// Container for the app header
let appHeader = Container.template($ => ({
    left: 0, right: 0, top: 0, height: 40,
    skin: new Skin({ fill: "#ff6666"}), style: smallerComicStyle,
    contents: [
        new buttonTemplate({text: $.backButton, action: 'getStarted', top: 0, bottom: 0, left: 10, right: 250, skin: transparentSkin, style: smallerComicStyle}),
        new Label({top:12, string: "capsule" }),
    ]
}));

let viewContainer = Button.template($ => ({
    height: 40, left:0, right: 110, skin: transparentSkin, name: $.title,
    contents:[
        new Picture({
            width: 40, left: 5,
            url: "assets/imgplaceholder.jpg",
        }),
        new Label({left: 60, top:0, string: $.title, style: smallerComicStyle}),
        new Label({left: 60, top:15, string: $.number, style: new Style({ font: "13px", color: "black" })}),
        new Label({left: 60, top:30, string: $.date, style: new Style({ font: "10px", color: "black" })}),
    ],
    Behavior: class extends ButtonBehavior {
        onTap(button){
            currentContainer = button.name;
            globalStatus = "unlocked";
            application.remove(application.first);
            application.add(new MainContainer({ string: "Ready!", backgroundColor: "#2e2e2e" }));
        }
    }
}));

let smartContainer = Container.template($ => ({
    height: 40, left: 0, right: 0, top: $.top, name: $.title,
    active: true, skin: new Skin({ fill : "#eaeaea" }),
    contents: [
        new viewContainer({title: $.title, number: $.number, date: $.date}),
    ],
}));


// Controls behavior of all buttons
function buttonOnTap(type){
    if (type == "sendOK"){
        var payload = {title: currentContainer};
        application.distribute('onButtonPress', 0.3);
    }
    if (type == "sendBad"){
        application.distribute('onButtonPress', 0.5);
    }
    if (type == "sendFresh"){
        application.distribute('onButtonPress', 0.7);
    }
    if (type == "viewFood"){
        if (deviceURL != "") {
        new Message(deviceURL + "getContainers").invoke(Message.TEXT)
                .then(json => {
                    allFoodContainers = JSON.parse(json);
                    application.remove(application.first);

let contentToScrollVertically = new Column({
    top: 0, left: 0, right: 0, height:1000,skin: new Skin({ fill : "#fafafa" }), name: 'vertical',
        contents: foodContainers(),
});
                    application.add(new containerList({ contentToScrollVertically }));
        });
      }
    }

    if (type == "getStarted"){
        application.remove(application.first);
        application.add(new MainContainer({ string: "Ready!", backgroundColor: "#2e2e2e" }));
    }

}

function customLabel($){
    if ($.contents){
        return $.contents
    } else{
        return Label($, { name: $.name + "Label" , top: 0, bottom: 0, left: 0, right: 0, style: $.style, string: $.text })
    }
}


// Hunger Monitoring
let hungerLevel = Container.template($ => ({
    top: 10, bottom: 10, right: 0, left: 0, skin: new Skin({fill: "black"}),
    contents: [
        new Label({name: "hungerString", string: "Hungry!", style: smallStyle})
    ]
}));

// Info about the food. Locked/Unlocked or reheating.
function getStatus($){
    if ($.status){
        return Label($, { string: $.status, style: smallStyle }),
    } else{
        return Label($, { string: globalStats, style: smallStyle }),
    }
}

let infoContainer = Button.template($ => ({
    top: $.top, bottom: $.bottom, left: 10, right: 180, skin: $.skin,
    contents: [
        Label($, { name: $.name , top: 0, bottom: 50, left: 0, right: 0, style: $.style, string: $.text }),
        new Container({name: $.text, top: 40, bottom: 10, right: 20,
                       left: 20, style: smallStyle, skin: new Skin({fill: "black"}),
                       contents:[
                            Label($, { string: globalStatus, style: smallStyle }),
                       ]
        })
    ],
    Behavior: class extends ButtonBehavior {
        onTap(button){
            resetLabel($.name);
        }
    }
}));

let sentLabel = new Label({top: 150, bottom: 80, left: 100, right: 100, style: largeWhite, string: "Notified!" });

// Main container for the device app
let MainContainer = Container.template($ => ({
    top: 0, bottom: 0, left: 0, right: 0,
    skin: new Skin({ fill: $.backgroundColor }),
    contents: [
        new buttonTemplate({name: "viewFood", action: "viewFood", text: "View containers", top: 10, bottom: 140, left: 180, right: 10, skin: new Skin({fill: "#e74c3c"}), style: smallerComicStyle}),
        new infoContainer({args: $, name: "hungerStatus", text: currentContainer, top: 10, bottom: 140, skin: new Skin({fill: "#2ecc71"}), style: comicStyle, action: "Hungry!"}),
        new Label({top:102, string: "Capsule (add logo)", style:textStyle }),
        new buttonTemplate({name: "sendBad", action: "sendBad", text: "Spoiled", top: 180, bottom: 10, left: 10, right: 220, skin: new Skin({fill: "red"}), style: smallerComicStyle}),
        new buttonTemplate({name: "sendOK", action: "sendOK", text: "Edible", top: 180, bottom: 10, left: 120, right: 120, skin: new Skin({fill: "yellow"}), style: smallerComicStyle}),
        new buttonTemplate({name: "sendFresh", action: "sendFresh", text: "Fresh", top: 180, bottom: 10, left: 220, right: 10, skin: new Skin({fill: "green"}), style: smallerComicStyle}),
    ],
}));



function foodContainers(){
    //var top = 5;
    let keys = Object.keys(allFoodContainers);
    var ret = [];
    for (var x = 0; x < keys.length; x++){
        var i = keys[x];
        ret.push(new smartContainer({title: allFoodContainers[i].title, number: "#" + i, date: allFoodContainers[i].date, top: 5}),);
    	//top += 40;
    }
    return ret;
}



// Container List
let containerList = Container.template($ => ({
    top: 0, bottom: 0, left: 0, right: 0,
    active: true, skin: new Skin({ fill : "#fafafa" }),
    contents: [
        new appHeader({backButton: "back"}),
         VerticalScroller($, {
          active: true, top: 45, bottom: 0,name: 'scroller',
          contents: [
            $.contentToScrollVertically,
            VerticalScrollbar(),
            TopScrollerShadow(),
            BottomScrollerShadow(),
    ]
  })
    ]
}));


Handler.bind("/setTimeout", {
    onInvoke: function(handler, message){
        handler.wait(message.requestObject.duration);
    }
});

let setTimeout = function(callback, duration) {
    new MessageWithObject("/setTimeout", {duration}).invoke().then(() => {
        callback();
    });
}

function removeNotification(){
    application.remove(sentLabel);
    application.distribute('onButtonPress', 0);
}

// Needed for cross-device handlers
var deviceURL = '';

Handler.bind("/discover", Behavior({
    onInvoke: function(handler, message){
        deviceURL = JSON.parse(message.requestText).url;
        new Message(deviceURL + "getContainers").invoke(Message.TEXT)
                .then(json => {
                    allFoodContainers = JSON.parse(json);
        });
    }
}));

Handler.bind("/forget", Behavior({
    onInvoke: function(handler, message){
        deviceURL = "";
    }
}));

// Configure all Pins in the AppBehavior and set up functionality
class AppBehavior extends Behavior {
    onDisplayed(application) {
        application.discover("capsulecompanionapp.project.kinoma.marvell.com");
    }
    onLaunch(application) {
        Pins.configure({
            led: {
                require: "Digital", // use built-in digital BLL
                pins: {
                    ground: { pin: 51, type: "Ground" },
                    digital: { pin: 52, direction: "output" },
                }
            },
            led2: {
                require: "Digital",
                pins: {
                    ground: {pin: 59, type: "Ground"},
                    digital: {pin: 60, direction: "output"},
                }
            },
        },  success => {
            if (success) {
                Pins.share("ws", {zeroconf: true, name: "pins-share-led"});
                application.add(new MainContainer({ string: "Ready!", backgroundColor: "#2e2e2e" }));
                Pins.repeat("/led/read", 500, value => {
                    if (value == 0.5){
                        application.remove(application.first);
                        globalStatus = "locked";
                        application.add(new MainContainer({ string: "Ready!", backgroundColor: "#2e2e2e", status: "locked" }));
                    } else if (value == 0.7){
                        application.remove(application.first);
                        globalStatus = "reheated";
                        application.add(new MainContainer({ string: "Ready!", backgroundColor: "#2e2e2e", status: "reheated" }));
                    } else if (value == 0.9){
                        application.remove(application.first);
                        globalStatus = "incubated";
                        application.add(new MainContainer({ string: "Ready!", backgroundColor: "#2e2e2e", status: "incubated" }));
                    }
                });
            } else {
                   application.add(new MainContainer({ string: "Error", backgroundColor: "red" }));
               };
        });
    }
    onButtonPress(application, value){
        trace("Writing value: " + value + "\n");
        if (value != 0){
            application.add(sentLabel);
            setTimeout(removeNotification, 2000);
        }
        Pins.invoke("/led2/write", value);
    }
    onQuit(application){
        application.forget("capsulecompanionapp.project.kinoma.marvell.com");
    }
}
application.behavior = new AppBehavior();
