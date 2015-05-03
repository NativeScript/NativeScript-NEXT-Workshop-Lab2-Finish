var applicationModule = require("application");
var imageModule = require("ui/image");
var gesturesModule = require("ui/gestures");
var frameModule = require("ui/frame");
var utils = require("utils/utils");

var templates = require( "../../shared/templates/templates");
var localStorage = require( "../../shared/local-storage/local-storage");

var _page;

exports.load = function(args) {
	_page = args.object;
};

exports.navigatedTo = function(args){
	populateTemplates();
	populateMyMemes();
};

function populateTemplates() {
	var container = _page.getViewById("templateContainer");
	clearOldMemes(container);

	templates.getTemplates(function(imageSource){
		var image = new imageModule.Image();
		image.imageSource = imageSource;

		image.observe(gesturesModule.GestureTypes.Tap, function () {
			templateSelected(imageSource);
		});

		container.addChild(image);
	});
}

function populateMyMemes() {
	var container = _page.getViewById("myMemeContainer");
	clearOldMemes(container);

	templates.getMyMemes(function(imageSource, fileName){
		var image = new imageModule.Image();
		image.imageSource = imageSource;

		image.observe(gesturesModule.GestureTypes.Tap, function () {
			myMemesActionSheet(imageSource, fileName);
		});

		container.addChild(image);
	});
}

function clearOldMemes(container) {
	console.log("***** Clearing X children:", container.getChildrenCount());

	for (var i = container.getChildrenCount() - 1; i >= 0; i-- ) {
		var childItem = container.getChildAt(i);

		container.removeChild(childItem);

		childItem.imageSource.setNativeSource(null);
		childItem.imageSource = null;
		childItem = null;
	}

	utils.GC();
}

function templateSelected(selectedImageSource) {
	if ( selectedImageSource ) {
		navigation.goCreateMeme(selectedImageSource);
	}
}
