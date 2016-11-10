import Pins from "pins";

import { // Imports for button behavior
    Button,
    ButtonBehavior 
} from 'buttons';


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


function hasBackButton($){
    if ($ && $.backButton){
        if ($.backToSplash){
            return new buttonTemplate({text: $.backButton, action: 'backToSplash', top: 0, bottom: 0, left: 10, right: 250, skin: transparentSkin, style: smallWhite}),
        }
        return new buttonTemplate({text: $.backButton, action: 'getStarted', top: 0, bottom: 0, left: 10, right: 250, skin: transparentSkin, style: smallWhite}),
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
        application.add(home);
    } else if (action == 'backToSplash'){
        application.remove(application.first);
        application.add(splash);
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
        new buttonTemplate({text: "Settings", top: 300, bottom: 40, left: 165, right: 15, skin: new Skin({ fill: "#ff6666"}), style: new Style({ font: "16px", color: "white" })})
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
                application.add(lockPage);
            }
        }
    }
}));

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
        new pictureTemplate({name: "unlocked", imgExt:".png", text: "Lock", top: 10, left: 250, bottom: 30, skin: transparentSkin, width: 30}),
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

var ready = new Label({name: "ready", left:0, right: 120, top:280, height:20, string:"Ready by:", style: labelStyle2});

// var date = new Label({name: "date", left:0, right: 30, top:340, height:20, string:"Date:", style: labelStyle3});

// Reheat button
let MyButtonTemplate = Button.template($ => ({
    top: 310, left: 0, right: 0,
    contents: [
        Label($, {left: 0, right: 0, height: 14, string: "Reheat", style: bigText})
    ],
    Behavior: class extends ButtonBehavior {
        onTap(button){
        }
    }
}));

let ReheatPage = Container.template($ => ({
    top: 0, bottom: 0, left: 0, right: 0,
    skin: orangeSkin,
    contents: [
      new appHeader({backButton: "back"}),
      reheat,
      container,
      kinomaLogo,
      ready,
      // new MyButtonTemplate()
    ],
}));








// LOCK PAGE
var lock = new Label({name: "lock", left:0, right: 0, top:50, height:20, string:"Lock My Avocado Container", style: labelStyle});

let container2 = new Container({
left: 0, right: 0, top: 80,height:2,
skin: new Skin({ fill: "black" })
});

let kinomaLogo2 = new Picture({height: 90, url: "assets/avocado.jpg"});
kinomaLogo2.coordinates = {height: 110, left: 0, right:0, top: 105, width: 100};

var until2 = new Label({name: "until", left:0, right: 120, top:280, height:20, string:"Lock until:", style: labelStyle2});

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
      // new MyButtonTemplate()
    ],
}));







// ADDS THE REHEAT PAGE
// application.add(new ReheatPage());

// ADDS THE LOCK PAGE
// application.add(new LockPage());


let reheatPage = new ReheatPage(); 
let lockPage = new LockPage();

application.add(splash);

