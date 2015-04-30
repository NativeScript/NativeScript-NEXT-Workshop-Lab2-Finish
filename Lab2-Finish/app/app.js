var application = require("application");

application.mainModule = "./components/splashscreen/splashscreen";
application.cssFile = "./app.css";


application.onLaunch = function (context) {
	console.log("***** application.onLaunch *****");
};

application.onResume = function (context) {
	console.log("***** application.onResume *****");
};

application.onSuspend = function () {
	console.log("***** application.onSuspend *****");
};

application.onExit = function () {
	console.log("***** application.onExit *****");
};

application.onUncaughtError = function (error) {
	console.log("***** application onUncaughtError *****", error);
};

global.baseViewDirectory = "./components/";
global.recentMemeFolderName = "myMemes";

global.appTemplateFolderName = "./images/templates";
global.localTemplateFolderName = "localTemplates";
global.everliveTemplateFolderName = "everliveTemplates";

global.everliveApiKey = "wFQtgknUo8yPqENA";
global.everliveBaseAddress = "http://api.everlive.com/v1/" + global.everliveApiKey;
global.everliveFunctionBaseAddress = "https://platform.telerik.com/bs-api/v1/" + global.everliveApiKey + "/Functions";

application.start();
