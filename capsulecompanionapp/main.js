import Pins from "pins";

import { // Imports for button behavior
    Button,
    ButtonBehavior 
} from 'buttons';

import {
    FieldScrollerBehavior,
    FieldLabelBehavior
} from 'field';

import {
    SystemKeyboard
} from 'keyboard';


// Various Styles to reuse
let smallBlack = new Style({ font: "15px", color: "black" });
let smallWhite = new Style({ font: "15px", color: "white" });
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

// Keep track of which locked
var lockedContainers = [];

function hasBackButton($){
    if ($ && $.backButton){
        if ($.backToSplash){
            return new buttonTemplate({text: $.backButton, action: 'backToSplash', top: 0, bottom: 0, left: 10, right: 250, skin: transparentSkin, style: smallBlack}),
        }
        return new buttonTemplate({text: $.backButton, action: 'getStarted', top: 0, bottom: 0, left: 10, right: 250, skin: transparentSkin, style: smallBlack}),
    }
}
// Container for the app header
let appHeader = Container.template($ => ({
    left: 0, right: 0, top: 0, height: 40,
    skin: new Skin({ fill: "#ff6666"}), style: smallBlack, 
    contents: [
        hasBackButton($),
        new Label({top:12, string: "capsule" }),
    ]
}));

// Controls behavior of all buttons built with ButtonTemplate
function buttonOnTap(action){
    if (action == 'getStarted'){ // splash -> home
        application.remove(application.first);
        application.add(new homeScreen());
    } else if (action == 'backToSplash'){
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
}

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

// Splash screen for Capsule
let splashScreen = Container.template($ => ({
    top: 0, bottom: 0, left: 0, right: 0,
    active: true, skin: backgroundSkin, //skin: new Skin({ fill : "#333333" }),
    contents: [
        new Picture({
            width: 320, top: -35,
            url: "assets/logo.png",
        }),
        new buttonTemplate({text: "Current Capsules", action: "getStarted", top: 150, bottom: 190, left: 15, right: 165, skin: new Skin({ fill: "#ff6666"}), style: new Style({ font: "16px", color: "white" })}),
        new buttonTemplate({text: "Sync Capsule", top: 150, bottom: 190, left: 165, right: 15, skin: new Skin({ fill: "#79cdcd"}), style: new Style({ font: "16px", color: "white" })}),
        new buttonTemplate({text: "Unsync Capsule", top: 300, bottom: 40, left: 15, right: 165, skin: new Skin({ fill: "#79cdcd"}), style: new Style({ font: "16px", color: "white" })}),
        new buttonTemplate({text: "Add Food", top: 300, bottom: 40, left: 165, right: 15, skin: new Skin({ fill: "#ff6666"}), style: new Style({ font: "16px", color: "white" })})
    ],
}));

// Picture template for the Image buttons
let pictureTemplate = Button.template($ => ({
    top: $.top, bottom: $.bottom, left: $.left, right: 10, skin: $.skin, name: $.name + "Button",
    contents: [
        new Picture({
            width: $.width, 
            url: "assets/" + $.name + $.imgExt,
        }),
        new Label({string: $.text, top: 30, style: new Style({ font: "13px", color: "black" })})
    ],
    Behavior: class extends ButtonBehavior {
        onTap(button){
            if ($.text == "Reheat"){
                application.remove(application.first);
                reheat.string = "Reheat " + button.container.name;
                application.add(reheatPage);
            } else if ($.text == "Lock"){
                application.remove(application.first);
                lock.string = "Lock " + button.container.name;
                lockedContainers.push(button.container.name);
                application.add(lockPage);
            }
        }
    }
}));

function isLockedOrUnlocked($){
    for (var i = 0; i < lockedContainers.length; i++){
        if (lockedContainers[i] == $.title){
            return new pictureTemplate({name: "locked", imgExt:".png", text: "Lock", top: 10, left: 250, bottom: 30, skin: transparentSkin, width: 30}),
        }
    }
    return new pictureTemplate({name: "unlocked", imgExt:".png", text: "Lock", top: 10, left: 250, bottom: 30, skin: transparentSkin, width: 30}),
}

// Smart Containers
let smartContainer = Container.template($ => ({
    height: 60, left: 0, right: 0, top: $.top, name: $.title,
    active: true, skin: new Skin({ fill : "#eaeaea" }),
    contents: [
        new Picture({
            width: 50, left: 5,
            url: "assets/imgplaceholder.jpg",
        }),
        new Label({left: 60, top:10, string: $.title, style: smallBlack}),
        new Label({left: 60, top:25, string: $.number, style: new Style({ font: "13px", color: "black" })}),
        new Label({left: 60, top:45, string: $.date, style: new Style({ font: "10px", color: "black" })}),
        new pictureTemplate({name: "lit", imgExt:".png", text: "Reheat", top: 10, left: 150, bottom: 30, skin: transparentSkin, width: 30}),
        isLockedOrUnlocked($)
    ],
}));

// App homescreen
let homeScreen = Container.template($ => ({
    top: 0, bottom: 0, left: 0, right: 0,
    active: true, skin: new Skin({ fill : "#fafafa" }),
    contents: [
        new appHeader({backButton: "back", backToSplash: true}),
        new smartContainer({title: "My Avocado Container", number: "#2", date: "10/17/16", top: 50}),
        new smartContainer({title: "Lasagna Container", number: "#3", date: "10/14/16", top: 120}),
        new smartContainer({title: "Fruits", number: "#5", date: "10/15/16", top: 190}),
        new smartContainer({title: "Vegetables", number: "#4", date: "10/16/16", top: 260}),
    ],
}));

let splash = new splashScreen(); 
let home = new homeScreen();

//**
//typeField: TYPING FIELD / KEYBOARD TEMPLATE
//double stacked field for date/time input
//**
let nameInputSkin = new Skin({ borders: { left: 2, right: 2, top: 2, bottom: 2 }, stroke: 'gray' });
let fieldStyle = new Style({ color: 'black', font: 'bold 24px', horizontal: 'left',
    vertical: 'middle', left: 5, right: 5, top: 5, bottom: 5 });
let fieldHintStyle = new Style({ color: '#aaa', font: '24px', horizontal: 'left',
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
                    string: "mm/dd/yy", name: "hint"
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
                    string: "time (ex: 2:00 pm)", name: "hint"
                }),
            ]
        })
    ]
}));

// REHEAT PAGE

var labelStyle = new Style( { font: "bold 25px", color:"black" } );
var labelStyle2 = new Style( { font: "bold 20px", color:"black" } );
var labelStyle3 = new Style( { font: "20px", color:"black" } );
var orangeSkin = new Skin({ fill: 'white' });
var bigText = new Style({ font: "bold 14px", color: "#333333" });

var reheat = new Label({name: "reheat", left:0, right: 0, top:50, height:20, string:"Reheat Lasagna Container", style: labelStyle});

var container = new Container({
left: 0, right: 0, top: 80,height:2,
skin: new Skin({ fill: "black" })
});

let kinomaLogo = new Picture({height: 90, url: "assets/lasagna.jpg"});
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
      new typeField({name1: "11/10/16", name2: "2:30 pm"}),
      new buttonTemplate({text: "Reheat", action: "reheatConfirm", top: 330, bottom: 100, left: 50, right: 50, skin: new Skin({ fill: "#a181ef"}), style: smallWhite})
    ],
    Behavior: class extends Behavior { //
        onTouchEnded(content) {
            SystemKeyboard.hide();
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
      new buttonTemplate({text: "Ok", action: "getStarted", top: 330, bottom: 100, left: 50, right: 50, skin: new Skin({ fill: "#a181ef"}), style: smallWhite})
    ],
    Behavior: class extends Behavior { //
        onTouchEnded(content) {
            SystemKeyboard.hide();
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
      new typeField({name1: "11/10/16", name2: "2:30 pm"}),
      new buttonTemplate({text: "Lock", action: "lockConfirm", top: 330, bottom: 100, left: 50, right: 50, skin: new Skin({ fill: "#a181ef"}), style: smallWhite})
      // new MyButtonTemplate()
    ],
    Behavior: class extends Behavior { //
        onTouchEnded(content) {
            SystemKeyboard.hide();
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
      new buttonTemplate({text: "Ok", action: "getStarted", top: 330, bottom: 100, left: 50, right: 50, skin: new Skin({ fill: "#a181ef"}), style: smallWhite})
    ],
    Behavior: class extends Behavior { //
        onTouchEnded(content) {
            SystemKeyboard.hide();
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

application.add(splash);

