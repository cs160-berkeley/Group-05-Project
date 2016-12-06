import Pins from "pins";

import { // Imports for button behavior
    Button,
    ButtonBehavior
} from 'buttons';

import {
    FieldScrollerBehavior,
    FieldLabelBehavior
} from 'field';

import KEYBOARD from './keyboard';

import {
   VerticalScroller,
   VerticalScrollbar,
   TopScrollerShadow,
   BottomScrollerShadow
} from 'scroller';



// Various Styles to reuse
let smallBlack = new Style({ font: "15px Lato", color: "black" });
let smallWhite = new Style({ font: "15px Lato", color: "white" });
let transparentSkin = new Skin({fill: "transparent"});

// Background
var backgroundTexture = new Texture("assets/background2.jpg");
var backgroundSkin = new Skin({
  width:320,
  height:480,
  texture: backgroundTexture,
  fill:"white"
});

//Global vars to hold most recently entered date + time
let globalDate = '2016';
let globalTime = '2:00 pm';

var top = 0;
var count = 0;

// Keep track of which locked
var lockedContainers = [];
var curContainer = null;
var curContainerImage;
var curContainerNumber;
var curContainerDate;
var curContainerFoodStatus = 'Fresh';
var allFoodContainers = {
    2 : {title: "Avocados", date: "10/17/16", picture: "assets/avocados.jpg"},
    3 : {title: "Lasagna", date: "10/14/16", picture: "assets/lasagna.jpg"},
    5 : {title: "Fruits", date: "10/15/16", picture: "assets/fruit.jpg"},
    4 : {title: "Vegetables", date: "10/16/16", picture: "assets/vegetables.jpg"}
};


function hasBackButton($){
    if ($ && $.backButton){
        if ($.backToSplash){
            return new backButtonImg({text: $.backButton, action: 'backToSplash', top: 0, bottom: 0, left: 10, right: 250, skin: transparentSkin, style: smallBlack}),
        }
        return new backButtonImg({text: $.backButton, action: 'getStarted', top: 0, bottom: 0, left: 10, right: 250, skin: transparentSkin, style: smallBlack}),
    }
}
// Container for the app header
let appHeader = Container.template($ => ({
    left: 0, right: 0, top: 0, height: 40,
    skin: new Skin({ fill: "#191919"}), style: smallBlack,
    contents: [
        hasBackButton($),
        //new Label({top:12, string: "capsule" }),
        new Picture({
            width: 100,
            url: "assets/header_logo.png",
        })
    ]
}));

function backbutton($) {
	if ($.action == 'getStarted' || $.action == 'addFood' || $.action == 'syncContainer' || $.action == 'unsyncContainer') {
		return Label($, { name: $.name , top: 0, bottom: 0, left: 0, right: 0, style: $.style, string: $.text });
	}
	return new Picture({left: -2, url: "assets/back1.png"});

}

let backButtonImg = Button.template($ => ({
    top: $.top, bottom: $.bottom, left: $.left, right: $.right, skin: $.skin,
    contents: [
        new Picture({left: -2, width:25, url: "assets/back1.png"})
    ],
    Behavior: class extends ButtonBehavior {
        onTouchEnded(button) {
            buttonOnTap($.action);
        }
    }
}));

// Reusable button template for the app
let buttonTemplate = Button.template($ => ({
    top: $.top, bottom: $.bottom, left: $.left, right: $.right, skin: $.skin,
    contents: [
        Label($, { name: $.name , top: 0, bottom: 0, left: 0, right: 0, style: $.style, string: $.text })
    ],
    Behavior: class extends ButtonBehavior {
        onTouchBegan(button) {
                prevSkin = button.skin;
                button.skin = new Skin({fill : "#295f35"});
        }
        onTouchEnded(button) {
            button.skin = prevSkin;
            buttonOnTap($.action);
        }
    }
}));

// Picture template for the Image buttons
let pictureTemplate = Button.template($ => ({
    top: $.top, bottom: $.bottom, left: $.left, right: 10, skin: $.skin, name: $.name + "Button",
    contents: [
        new Picture({
            width: $.width,
            url: "assets/" + $.name + $.imgExt,
        }),
        new Label({string: $.text, top: 30, style: new Style({ font: "13px Lato", color: "black" })}),
        ifPictureHasTime($)
    ],
    Behavior: class extends ButtonBehavior {
        onTap(button){
            if ($.text == "Reheat"){
                if (!isContainerLocked(button.container.name)){
                    application.remove(application.first);
                    reheat.string = "Reheat " + button.container.name;
                    application.add(reheatPage);
                }
            } else if ($.text == "Lock"){
                application.remove(application.first);
                lock.string = "Lock " + button.container.name;
                curContainer = button.container.name;
                application.add(lockPage);
            }
        }
    }
}));

let viewContainer = Button.template($ => ({
    height: 60, left:0, right: 110, skin: new Skin({ fill : "transparent" }),
    contents:[
        new Picture({
            width: 50, left: 5,
            url: $.picture,
        }),
        new Label({left: 60, top:10, string: $.title, style: smallBlack}),
        new Label({left: 60, top:25, string: $.number, style: new Style({ font: "13px Lato", color: "black" })}),
        new Label({left: 60, top:45, string: $.date, style: new Style({ font: "10px Lato", color: "black" })}),
    ],
    Behavior: class extends ButtonBehavior {
        onTap(button){
            curContainerNumber = $.number;
            curContainerDate = $.date;
            curContainer = $.title;
            curContainerImage = $.picture;
            viewTapped();
        }
    }
}));

// Smart Containers
let smartContainer = Container.template($ => ({
    height: 65, left: 0, right: 0, top: $.top, name: $.title,
    active: true, skin: new Skin({ fill : "#eaeaea" }),
    contents: [
        new viewContainer({title: $.title, number: $.number, date: $.date, picture: $.picture}),
        new pictureTemplate({name: "lit", imgExt:".png", text: "Reheat", top: 10, left: 150, bottom: 30, skin: transparentSkin, width: 30}),
        isLockedOrUnlocked($)
    ],
}));

// Content that will be scrollable
let contentToScrollVertically = Column.template($ => ({
    top: 0, left: 0, right: 0, height:1000,skin: new Skin({ fill : "#fafafa" }), name: 'vertical',
        contents: foodContainers(),
}));

// Controls behavior of all buttons built with ButtonTemplate
function buttonOnTap(action){
    if (action == 'getStarted'){ // splash -> home
        application.remove(application.first);
        application.add(new homeScreen());
    }
    if (action == 'addLockAndGoHome'){
        lockedContainers.push({title: curContainer, date: globalDate, time: globalTime});
        application.distribute('onLockorReheatContainer', 0.5);
        application.remove(application.first);
        application.add(new homeScreen());
    }
    if (action == 'reheatAndGoHome'){
        application.distribute('onLockorReheatContainer', 0.7);
        application.remove(application.first);
        application.add(new homeScreen());
    }
    if (action == 'backToSplash'){
        application.remove(application.first);
        application.add(splash);
    }
    if (action == 'reheatConfirm'){
        application.remove(application.first);
        application.add(new ReheatConfirmPage({}));
    }
    if (action == 'lockConfirm'){
        application.remove(application.first);
        application.add(new LockConfirmPage({}));
    }
    if (action == 'addFood'){
        application.remove(application.first);
        application.add(new foodPage());
    }
    if (action == 'confirmFood'){
        if (allFoodContainers[globalTime]){
            allFoodContainers[globalTime].title = globalDate;
        }
        application.remove(application.first);
        application.add(new homeScreen());
    }
    if (action == 'syncContainer'){
        application.remove(application.first);
        application.add(new syncScreen());
    }
    if (action == 'unsyncContainer'){
        application.remove(application.first);
        application.add(new unsyncScreen());
    }
    if (action == 'confirmSync'){
        if (!allFoodContainers[globalDate]){ // No repeated container numbers
            allFoodContainers[globalDate] = {title : "(Empty Container)", date: globalTime};
        }

        application.remove(application.first);
        application.add(new homeScreen()); 

    }
    if (action == 'confirmUnsync'){
        if (allFoodContainers[globalDate]){ // Make sure it exists
            delete allFoodContainers[globalDate];
        }
        application.remove(application.first);
        application.add(new homeScreen()); 
    }
}

var prevSkin;

function getIcon($) {
	if ($.action == "getStarted") {
		return new Picture({width: 50, url: "assets/list.png",})
	}
	if ($.action == "syncContainer") {
		return new Picture({width: 50, url: "assets/sync.png",})
	}
	if ($.action == "unsyncContainer") {
		return new Picture({width: 50, url: "assets/unsync.png",})
	}
	if ($.action == "addFood") {
		return new Picture({width: 50, url: "assets/add.png",})
	}
}

let splashButtonTemplate = Button.template($ => ({
    top: $.top, bottom: $.bottom, left: $.left, right: $.right, skin: $.skin,
    contents: [
    	getIcon($),
        Label($, { name: $.name , top: 100, bottom: 0, left: 0, right: 0, style: $.style, string: $.text })
    ],
    Behavior: class extends ButtonBehavior {
        onTouchBegan(button) {
                prevSkin = button.skin;
                button.skin = new Skin({fill : "#295f35"});
        }
        onTouchEnded(button) {
            button.skin = prevSkin;
            buttonOnTap($.action);
        }
    }
}));

// Splash screen for Capsule
let splashScreen = Container.template($ => ({
    top: 0, bottom: 0, left: 0, right: 0, name: "splashScreen",
    active: true, skin: backgroundSkin, //skin: new Skin({ fill : "#333333" }),
    contents: [
        new Picture({
            width: 320, top: -35,
            url: "assets/capsule_logo.png",
        }),
        new buttonTemplate({text: "Current Capsules", action: "getStarted", top: 150, bottom: 190, left: 15, right: 165, skin: new Skin({ fill: "#4fe372"}), style: new Style({ font: "16px Lato", color: "white" })}),
        new buttonTemplate({text: "Sync Capsule", action: "syncContainer", top: 150, bottom: 190, left: 165, right: 15, skin: new Skin({ fill: "#08CA33"}), style: new Style({ font: "16px Lato Lato", color: "white" })}),
        new buttonTemplate({text: "Unsync Capsule", action: "unsyncContainer", top: 300, bottom: 40, left: 15, right: 165, skin: new Skin({ fill: "#08CA33"}), style: new Style({ font: "16px Lato", color: "white" })}),
        new buttonTemplate({text: "Add Food", action: "addFood", top: 300, bottom: 40, left: 165, right: 15, skin: new Skin({ fill: "#4fe372"}), style: new Style({ font: "16px Lato", color: "white" })})
    ],
}));

//sync for food containers
let syncScreen = Container.template($ => ({
    top: 0, bottom: 0, left: 0, right: 0, name: "syncScreen",
    active: true, skin: new Skin({ fill : "#eaeaea" }), //skin: new Skin({ fill : "#333333" }),
    contents: [
      new appHeader({backButton: "back", backToSplash: true}),
      new Label({string: "Sync a new container", top: 60, style: labelStyle}),
      new Container({left: 0, right: 0, top: 100,height:2,skin: new Skin({ fill: "black" })}),,
      new typeField({name1: "", name2: "", placeholder1: "Container #...", placeholder2: "Container Date"}),
      new buttonTemplate({text: "Sync Container", action: "confirmSync", top: 330, bottom: 100, left: 50, right: 50, skin: new Skin({ fill: "#4fe372"}), style: smallWhite})
    ],
    Behavior: class extends Behavior { //
        onTouchEnded(content) {
            KEYBOARD.hide();
            content.focus();
        }
    }
}));

//sync for food containers
let unsyncScreen = Container.template($ => ({
    top: 0, bottom: 0, left: 0, right: 0, name: "syncScreen",
    active: true, skin: new Skin({ fill : "#eaeaea" }), //skin: new Skin({ fill : "#333333" }),
    contents: [
      new appHeader({backButton: "back", backToSplash: true}),
      new Label({string: "Unsync a container", top: 60, style: labelStyle}),
      new Container({left: 0, right: 0, top: 100,height:2,skin: new Skin({ fill: "black" })}),,
      new typeField({name1: "", name2: "", placeholder1: "Container #...", placeholder2: "Container Date"}),
      new buttonTemplate({text: "Unsync Container", action: "confirmUnsync", top: 330, bottom: 100, left: 50, right: 50, skin: new Skin({ fill: "#4fe372"}), style: smallWhite})
    ],
    Behavior: class extends Behavior { //
        onTouchEnded(content) {
            KEYBOARD.hide();
            content.focus();
        }
    }
}));

function ifPictureHasTime($){
    if ($.time){
        return new Label({string: $.time, top: 40, style: new Style({ font: "10px Lato", color: "black" })})
    }
}

function isContainerLocked(name){
    for (var i = 0; i < lockedContainers.length; i++){
        var cont = lockedContainers[i];
        if (cont.title == name) { return true; }
    }
    return false;
}



let containerDetailScreen = Container.template($ => ({
    top: 0, bottom: 0, left: 0, right: 0,
    active: true, skin: new Skin({ fill : "#fafafa" }),
    contents: $.content,
}));

function isLockedOrUnlocked($){
    for (var i = 0; i < lockedContainers.length; i++){
        var cont = lockedContainers[i];
        if (cont.title == $.title){
            return new pictureTemplate({name: "locked", imgExt:".png", text: cont.date, time: cont.time, top: 10, left: 250, bottom: 30, skin: transparentSkin, width: 30}),
        }
    }
    return new pictureTemplate({name: "unlocked", imgExt:".png", text: "Lock", time: "", top: 10, left: 250, bottom: 30, skin: transparentSkin, width: 30}),
}

function viewTapped(){
    application.remove(application.first);
    var color;
    if (curContainerFoodStatus == "Fresh"){
        color = "green";
    } else if (curContainerFoodStatus == "Edible"){
        color = "yellow";
    } else{
        color = "red";
    }
    application.add(new containerDetailScreen({
        content:[
            new appHeader({backButton: "back", backToSplash: false}),
            new Picture({top: -75, width: 100, url: curContainerImage }),
            new Label({top:200, string: curContainer, style: smallBlack}),
            new Label({top:250, string: curContainerNumber, style: smallBlack}),
            new Label({top:300, string: curContainerDate, style: smallBlack}),
            new Label({top:350, string: "Food is " + curContainerFoodStatus + "!", style: new Style({ font: "20px Lato", color: color })}),
        ]
    }));
}




function foodContainers(){
    var top = -20;
    let keys = Object.keys(allFoodContainers);
    var ret = [];
    for (var x = 0; x < keys.length; x++){
        var i = keys[x];
        // top += 70;
        ret.push(new smartContainer({title: allFoodContainers[i].title, number: "#" + i, date: allFoodContainers[i].date, picture:allFoodContainers[i].picture, top: 5}),);
    }
    return ret;
}
// App homescreen
let homeScreen = Container.template($ => ({
    top: 0, bottom: 0, left: 0, right: 0,
    active: true, skin: new Skin({ fill : "#fafafa" }),
    contents: [
        VerticalScroller($, {
          active: true, top: 45, bottom: 0,name: 'scroller',
          contents: [
            new contentToScrollVertically(),
        VerticalScrollbar(),
        TopScrollerShadow(),
        BottomScrollerShadow(),
    ]
  }),
  new appHeader({backButton: "back", backToSplash: true}),
    ]
}));

let splash = new splashScreen();
let home = new homeScreen();

//**
//typeField: TYPING FIELD / KEYBOARD TEMPLATE
//double stacked field for date/time input
//**
let nameInputSkin = new Skin({ borders: { left: 2, right: 2, top: 2, bottom: 2 }, stroke: 'gray' });
let fieldStyle = new Style({ color: 'black', font: 'bold 24px Lato', horizontal: 'left',
    vertical: 'middle', left: 5, right: 5, top: 5, bottom: 5 });
let fieldHintStyle = new Style({ color: '#aaa', font: '24px Lato', horizontal: 'left',
    vertical: 'middle', left: 5, right: 5, top: 5, bottom: 5 });
let whiteSkin = new Skin({ fill: "white" });
let fieldLabelSkin = new Skin({ fill: ['transparent', 'transparent', '#C0C0C0', '#acd473'] });

let typeField = Column.template($ => ({
    width: 200, height: 72, skin: nameInputSkin, contents: [
        Scroller($, {
            left: 4, right: 4, top: 4, bottom: 4, active: true,
            Behavior: FieldScrollerBehavior, clip: true,
            contents: [
                Label($, {
                    left: 0, top: 0, bottom: 0, skin: fieldLabelSkin,
                    style: fieldStyle, anchor: 'NAME',
                    editable: true, string: $.name1,
                    Behavior: class extends FieldLabelBehavior {
                        onEdited(label) {
                            let data = this.data;
                            data.name = label.string;
                            label.container.hint.visible = (data.name.length == 0);
                            trace(data.name+"\n");
                            globalDate = data.name;
                        }
                    },
                }),
                Label($, {
                    left: 4, right: 4, top: 4, bottom: 4, style: fieldHintStyle,
                    string: $.placeholder1, name: "hint"
                }),
            ]
        }),
        Scroller($, {
            left: 4, right: 4, top: 4, bottom: 4, active: true,
            Behavior: FieldScrollerBehavior, clip: true,
            contents: [
                Label($, {
                    left: 0, top: 0, bottom: 0, skin: fieldLabelSkin,
                    style: fieldStyle, anchor: 'NAME',
                    editable: true, string: $.name2,
                    Behavior: class extends FieldLabelBehavior {
                        onEdited(label) {
                            let data = this.data;
                            data.name = label.string;
                            label.container.hint.visible = (data.name.length == 0);
                            trace(data.name+"\n");
                            globalTime = data.name;
                        }
                    },
                }),
                Label($, {
                    left: 4, right: 4, top: 4, bottom: 4, style: fieldHintStyle,
                    string: $.placeholder2, name: "hint"
                }),
            ]
        })
    ]
}));

// REHEAT PAGE

var labelStyle = new Style( { font: "bold 25px Lato", color:"black" } );
var labelStyle2 = new Style( { font: "bold 20px Lato", color:"black" } );
var labelStyle3 = new Style( { font: "20px Lato", color:"black" } );
var orangeSkin = new Skin({ fill: 'white' });
var bigText = new Style({ font: "bold 14px Lato", color: "#333333" });

var reheat = new Label({name: "reheat", left:0, right: 0, top:50, height:20, string:"Reheat Lasagna Container", style: labelStyle});

var container = new Container({
left: 0, right: 0, top: 80,height:2,
skin: new Skin({ fill: "black" })
});

let kinomaLogo = new Picture({height: 90, url: "assets/lasagn.jpg"});
kinomaLogo.coordinates = {height: 110, left: 0, right:0, top: 105, width: 100};

var ready = new Label({name: "ready", left:0, right: 120, top:180, height:20, string:"Ready by:", style: labelStyle2});

// var date = new Label({name: "date", left:0, right: 30, top:340, height:20, string:"Date:", style: labelStyle3});

// Reheat button template
let myButtonTemplate = Button.template($ => ({
    top: 200, left: 50, right: 50,
    contents: [
        Label($, {height: 14, string: "Reheat", style: bigText})
    ],
}));

let ReheatPage = Container.template($ => ({
    top: 0, bottom: 0, left: 0, right: 0,
    skin: orangeSkin, active: true,
    contents: [
      new appHeader({backButton: "back"}),
      reheat,
      container,
      kinomaLogo,
      ready,
      new typeField({name1: "", name2: "", placeholder1: "mm/dd/yy", placeholder2: "time (ex: 2:00 pm)"}),
      new buttonTemplate({text: "Reheat", action: "reheatConfirm", top: 330, bottom: 100, left: 50, right: 50, skin: new Skin({ fill: "#4fe372"}), style: smallWhite})
    ],
    Behavior: class extends Behavior { //
        onTouchEnded(content) {
            KEYBOARD.hide();
            content.focus();
        }
    }
}));

//New: reheating lock page

let ReheatConfirmPage = Container.template($ => ({
    top: 0, bottom: 0, left: 0, right: 0,
    skin: orangeSkin, active: true,
    contents: [
      new Label({name: "ready", left:0, right: 0, top:180, height:20, string:"Reheat set: " + globalDate + ", " + globalTime, style: labelStyle2}),
      new buttonTemplate({text: "Ok", action: "reheatAndGoHome", top: 330, bottom: 100, left: 50, right: 50, skin: new Skin({ fill: "#4fe372"}), style: smallWhite})
    ],
    Behavior: class extends Behavior { //
        onTouchEnded(content) {
            KEYBOARD.hide();
            content.focus();
        }
    }
}));


// LOCK PAGE
var lock = new Label({name: "lock", left:0, right: 0, top:50, height:20, string:"Lock My Avocado Container", style: labelStyle});

let container2 = new Container({
left: 0, right: 0, top: 80,height:2,
skin: new Skin({ fill: "black" })
});

let kinomaLogo2 = new Picture({height: 90, url: "assets/avocado.jpg"});
kinomaLogo2.coordinates = {height: 110, left: 0, right:0, top: 105, width: 100};

var until2 = new Label({name: "until", left:0, right: 120, top:180, height:20, string:"Lock until:", style: labelStyle2});

// var date = new Label({name: "date", left:0, right: 30, top:340, height:20, string:"Date:", style: labelStyle3});

// Reheat button
let MyButtonTemplate2 = Button.template($ => ({
    top: 310, left: 0, right: 0,
    contents: [
        Label($, {left: 0, right: 0, height: 14, string: "Lock", style: bigText})
    ],
    Behavior: class extends ButtonBehavior {
        onTap(button){
        }
    }
}));

let LockPage = Container.template($ => ({
    top: 0, bottom: 0, left: 0, right: 0,
    skin: orangeSkin,
    contents: [
      new appHeader({backButton: "back"}),
      lock,
      container2,
      kinomaLogo2,
      until2,
      new typeField({name1: "", name2: "", placeholder1: "mm/dd/yy", placeholder2: "time (ex: 2:00 pm)"}),
      new buttonTemplate({text: "Lock", action: "lockConfirm", top: 330, bottom: 100, left: 50, right: 50, skin: new Skin({ fill: "#4fe372"}), style: smallWhite})
      // new MyButtonTemplate()
    ],
    Behavior: class extends Behavior { //
        onTouchEnded(content) {
            KEYBOARD.hide();
            content.focus();
        }
    }
}));

//New: confirm lock page

let LockConfirmPage = Container.template($ => ({
    top: 0, bottom: 0, left: 0, right: 0,
    skin: orangeSkin, active: true,
    contents: [
      new Label({name: "ready", left:0, right: 0, top:180, height:20, string:"Locked until: " + globalDate + ", " + globalTime, style: labelStyle2}),
      new buttonTemplate({text: "Ok", action: "addLockAndGoHome", top: 330, bottom: 100, left: 50, right: 50, skin: new Skin({ fill: "#4fe372"}), style: smallWhite})
    ],
    Behavior: class extends Behavior { //
        onTouchEnded(content) {
            KEYBOARD.hide();
            content.focus();
        }
    }
}));


//Add food page
let foodPage = Container.template($ => ({
    top: 0, bottom: 0, left: 0, right: 0,
    skin: orangeSkin,
    contents: [
      new appHeader({backButton: "back", backToSplash: true}),
      new Label({string: "Add Food", top: 60, style: labelStyle}),
      new Container({left: 0, right: 0, top: 100,height:2,skin: new Skin({ fill: "black" })}),
      new typeField({name1: "", name2: "", placeholder1: "Descriptive Name", placeholder2: "Container #..."}),
      new buttonTemplate({text: "Add Food", action: "confirmFood", top: 330, bottom: 100, left: 50, right: 50, skin: new Skin({ fill: "#4fe372"}), style: smallWhite})
    ],
    Behavior: class extends Behavior { //
        onTouchEnded(content) {
            KEYBOARD.hide();
            content.focus();
        }
    }
}));

// ADDS THE REHEAT PAGE
// application.add(new ReheatPage());

// ADDS THE LOCK PAGE
// application.add(new LockPage());


let reheatPage = new ReheatPage();
let lockPage = new LockPage();

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

Handler.bind("/getContainers", Behavior({
    onInvoke: function(handler, message){
        message.responseText = JSON.stringify( allFoodContainers );
        message.status = 200;
    }
}));

// Needed for cross-device handlers
var deviceURL = '';

// Configure application behavior and pins
let remotePins;
class AppBehavior extends Behavior {
    onLaunch(application) {
        application.shared = true;
        application.add(splash);
        let discoveryInstance = Pins.discover(
            connectionDesc => {
                if (connectionDesc.name == "pins-share-led") {
                    trace("Connecting to remote pins\n");
                    remotePins = Pins.connect(connectionDesc);
                    remotePins.repeat("/led2/read", 50, function(result) {
                       if (result == 0.3) {
                        curContainerFoodStatus = "Edible";
                        if (curContainer) viewTapped();
                       } else if (result == 0.5){
                        curContainerFoodStatus = "Bad";
                        if (curContainer) viewTapped();
                       } else if (result == 0.7){
                        curContainerFoodStatus = "Fresh";
                        if (curContainer) viewTapped();
                       }
                    });

                }
            },
            connectionDesc => {
                if (connectionDesc.name == "pins-share-led") {
                    trace("Disconnected from remote pins\n");
                    remotePins = undefined;
                }
            }
        );
    }
    onLockorReheatContainer(application, value) {
        // send 0.5 to lock, send 0.7 to reheat
        if (remotePins) remotePins.invoke("/led/write", value);
        setTimeout(function(){remotePins.invoke("/led/write", 0);}, 2000);
    }
    onQuit(application){
        application.shared = false;
    }
}

application.behavior = new AppBehavior();
