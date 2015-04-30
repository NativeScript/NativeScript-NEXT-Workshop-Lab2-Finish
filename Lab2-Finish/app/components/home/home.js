var applicationModule = require("application");
var imageModule = require("ui/image");
var gesturesModule = require("ui/gestures");
var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var utils = require("utils/utils");

var navigation = require( "../../shared/navigation");
var templates = require( "../../shared/templates/templates");
var localStorage = require( "../../shared/local-storage/local-storage");
var socialShare = require("../social-share/social-share");

var _page;

exports.load = function(args) {
	console.log("Home loaded Event Fired");
	_page = args.object;

	if (applicationModule.ios) {
		_page.ios.title = "JustMeme";
		var controller = frameModule.topmost().ios.controller;

		var navigationItem = controller.visibleViewController.navigationItem;
		navigationItem.setHidesBackButtonAnimated(true, false);

		var navBar = controller.navigationBar;
		navBar.barTintColor = UIColor.colorWithRedGreenBlueAlpha(.35, .90, .0, 1.0);
		navBar.barStyle = 0;
		navBar.tintColor = UIColor.blackColor();

		navBar.titleTextAttributes =
			new NSDictionary(
				[UIColor.blackColor()],
				[NSForegroundColorAttributeName]
			);
	}
};

exports.unloaded = function(args){
	console.log("Home Unloaded Event Fired");
};

exports.navigatedTo = function(args){
	console.log("Home Navigated To Event Fired");

	populateTemplates();
	populateMyMemes();
};

exports.createNewTemplate = function() {
	navigation.goCreateTemplate();
};

function populateTemplates() {
	//Get our parrent element such that we can add our items to it dynamically
	var container = _page.getViewById("templateContainer");
	clearOldMemes(container);

	templates.getTemplates(function(imageSource){
		var image = new imageModule.Image();
		image.imageSource = imageSource;

		image.observe(gesturesModule.GestureTypes.tap, function () {
			templateSelected(imageSource);
		});

		//add to the element.
		container.addChild(image);
	});
}

function populateMyMemes() {
	//Get our parent element such that we can add our items to it dynamically
	var container = _page.getViewById("myMemeContainer");
	clearOldMemes(container);

	templates.getMyMemes(function(imageSource, fileName){
		//Create a new image element
		var image = new imageModule.Image();
		image.imageSource = imageSource;

		//What do to...  share delete?
		image.observe(gesturesModule.GestureTypes.tap, function () {
			myMemesActionSheet(imageSource, fileName);
		});

		//add to the element.
		container.addChild(image);
	});
}

function myMemesActionSheet (imageSource, imageFileName) {
	var options = {
		title: "My Memes",
		message: "What Do You Want To Do?",
		cancelButtonText: "Cancel",
		actions: ["Delete", "Delete All", "Share"]
	};

	dialogsModule.action(options).then(function (result) {
		switch (result) {
			case "Delete" :
				deleteMeme(imageFileName);
				break;
			case "Share" :
				shareMeme(imageSource);
				break;
			case "Delete All" :
				deleteAllMemes();
				break;
		}
	});
}

function shareMeme(imageSource) {
	socialShare.share(imageSource);
}

function deleteMeme(imageFileName) {
	localStorage.deleteMeme(imageFileName)
		.then(function (result) {
			console.log("Meme Removed")

			//Repopulate the screen
			populateMyMemes();

		}).catch(function (error) {
			analyticsMonitor.trackException(error, "Delete Memes Failed");
			console.log("***** ERROR:", error);
		});
}

function deleteAllMemes() {

	dialogsModule.confirm("Are you sure?")
		.then(function (result) {
			if(result) {
				localStorage.deleteAllMemes().then(function () {
					console.log("Folder Cleared")

					//Repopulate the screen
					populateMyMemes();
				}).catch(function (error) {
					console.log("***** ERROR:", error);
				});
			}
		});
}

function clearOldMemes(container) {

	/*
	//you could loop through like this but the visual tree will have to reindex the items and shift things
	while (container.getChildrenCount() > 0) {
		container.removeChild(container.getChildAt(0));
	}
	*/

	//Or just work backwards picking off the back
	console.log("***** Clearing X children:", container.getChildrenCount());

	for (var i = container.getChildrenCount() - 1; i >= 0; i-- ) {
		var childItem = container.getChildAt(i);

		//Removing the child will call its onUnloaded method and all gesture observers will be cleared.
		container.removeChild(childItem);

		// Prevent possible memory leaks
		childItem.imageSource.setNativeSource(null);
		childItem.imageSource = null;
		childItem = null;
	}

	utils.GC();
}

function templateSelected(selectedImageSource) {
	if ( selectedImageSource ) {
		analyticsMonitor.trackFeature("Home.TemplateSelected");
		navigation.goCreateMeme(selectedImageSource);
	}
}
