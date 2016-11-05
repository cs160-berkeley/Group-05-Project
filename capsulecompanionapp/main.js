import Pins from "pins";

import { // Imports for button behavior
    Button,
    ButtonBehavior 
} from 'buttons';


// Various Styles to reuse
let smallBlack = new Style({ font: "15px", color: "black" });
let smallWhite = new Style({ font: "15px", color: "white" });

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

// App homescreen
let homeScreen = Container.template($ => ({
    top: 0, bottom: 0, left: 0, right: 0,
    active: true, skin: new Skin({ fill : "#fafafa" }),
    contents: [
        new appHeader(),
        new Label({top:100, string: "capsule home page", style: smallBlack}),
    ],
}));

let splash = new splashScreen(); 
let home = new homeScreen();

application.add(splash);

