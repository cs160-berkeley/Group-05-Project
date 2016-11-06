    import Pins from "pins";

import { // Imports for button behavior
    Button,
    ButtonBehavior 
} from 'buttons';


// Various Styles to reuse
let smallBlack = new Style({ font: "15px", color: "black" });
let smallWhite = new Style({ font: "15px", color: "white" });
let transparentSkin = new Skin({fill: "transparent"});

// Container for the app header
let appHeader = Container.template($ => ({
    left: 0, right: 0, top: 0, height: 40,
    skin: new Skin({ fill : "#a181ef" }), style: smallBlack, 
    contents: [
        new Label({top:12, string: "capsule" }),
    ]
}));

// Controls behavior of all buttons built with ButtonTemplate
function buttonOnTap(action){
    if (action == 'getStarted'){ // splash -> home
        application.remove(application.first);
        application.add(home);
    }
}

// Reusable button template for the app
let buttonTemplate = Button.template($ => ({
    top: $.top, bottom: $.bottom, left: 10, right: 10, skin: $.skin,
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
    active: true, skin: new Skin({ fill : "#191919" }),
    contents: [
        new Label({top:100, string: "capsule splash page", style: smallWhite}),
        new buttonTemplate({text: "Get Started", action: "getStarted", top: 400, bottom: 10, skin: new Skin({ fill: "#a181ef"}), style: smallWhite})
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
    ]
}));

// Smart Containers
let smartContainer = Container.template($ => ({
    height: 60, left: 0, right: 0,
    active: true, skin: new Skin({ fill : "#eaeaea" }),
    contents: [
        new Picture({
            width: 50, left: 5,
            url: "assets/imgplaceholder.jpg",
        }),
        new Label({left: 60, top:10, string: "Food Item", style: smallBlack}),
        new Label({left: 60, top:30, string: "Container Name/Num", style: new Style({ font: "13px", color: "black" })}),
        new pictureTemplate({name: "lit", imgExt:".png", text: "Reheat", top: 10, left: 150, bottom: 30, skin: transparentSkin, width: 30}),
        new pictureTemplate({name: "unlocked", imgExt:".png", text: "Lock", top: 10, left: 250, bottom: 30, skin: transparentSkin, width: 30}),
    ],
}));

// App homescreen
let homeScreen = Container.template($ => ({
    top: 0, bottom: 0, left: 0, right: 0,
    active: true, skin: new Skin({ fill : "#fafafa" }),
    contents: [
        new appHeader(),
        new smartContainer(),
        new Label({top:100, string: "capsule home page", style: smallBlack}),
    ],
}));

let splash = new splashScreen(); 
let home = new homeScreen();

application.add(splash);

