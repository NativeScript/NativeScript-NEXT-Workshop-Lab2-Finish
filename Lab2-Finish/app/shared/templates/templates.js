var imageSource = require("image-source");
var httpModule = require("http");

var everlive = require("../everlive/everlive");
var localStorage = require("../local-storage/local-storage");

module.exports = {
	getMyMemes: function(callback) {
		return _getMyMemes(callback);
	},
	getTemplates: function(callback) {
		return _getTemplates(callback);
	},
	addNewPublicTemplate: function(fileName, imageSource) {
		return _addNewPublicTemplate(fileName, imageSource);
	},
	addNewLocalTemplate: function(fileName, imageSource) {
		return _addNewLocalTemplate(fileName, imageSource);
	}
}

function _addNewPublicTemplate(fileName, imageSource) {
	localStorage.saveEverliveTemplateLocally(fileName, imageSource);
	return everlive.addTemplate(fileName, imageSource);
}

function _addNewLocalTemplate(fileName, imageSource) {
	return localStorage.saveTemplateLocally(fileName, imageSource);
}

function _getMyMemes(callback) {
	var recentMemes = [];

	localStorage.getMyMemes()
	.then(function (entities) {

		entities.forEach(function (entity) {
			var source = imageSource.fromFile(entity.path);
			recentMemes.push({ source: source, fileName: entity.name, lastModified: entity.lastModified});
		});

		//sort to get in the order of most recent
		recentMemes.sort(function (a, b) {
			return b.lastModified.getTime() - a.lastModified.getTime();
		});

		recentMemes.forEach(function(meme) {
			callback(meme.source, meme.fileName);
		});

	});
}

function _getTemplates(callback) {

	localStorage.getAppTemplates()
	.then(function(entities){
		//Load the app templates
		entities.forEach(function (template) {
			callback(imageSource.fromFile(template.path));
		});
	});

	localStorage.getMyTemplates()
	.then(function(entities){
		//Load the app templates
		entities.forEach(function (template) {
			callback(imageSource.fromFile(template.path));
		});
	});

	_getTemplatesFromEverlive(callback);
}

function _getTemplatesFromEverlive(callback) {

	everlive.getTemplateIndex()
		.then(function(result) {
			//console.log("***** Everlive GetTemplates Payload:", JSON.stringify(result));

			var results = JSON.parse(result.content);
			console.log("***** Everlive Templates Found:", results.length);

			results.forEach(function(template) {
				//Before we download, check to see if we already have it...
				if (!localStorage.doesEverliveTemplateExist(template.FileName)) {
					console.log("**** Getting " + template.Url + " ****");

					httpModule.getImage(template.Url).then(function(imageSource) {
						console.log("**** Got " + template.Url + " ****");

						var saved = localStorage.saveEverliveTemplateLocally(template.FileName, imageSource);
						if (saved) {
							callback(imageSource);
						}
					});
				} else {
					var templateImage = localStorage.getEverliveTemplateFile(template.FileName);
					callback(templateImage);
				}
			});
		}).catch(function(error){
			console.log("***** ERROR", JSON.stringify(error));
		});
}
