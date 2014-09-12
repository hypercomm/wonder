
/**
 * instantiate a new Config object
 * @param {type} appID ... the application prefix for loading of the profile names
 * @param {type} settingsDivID  ... the id of the div with the settings 
 * @param {type} profileCombo ... the id of the combo box with the profile names
 * @returns {Config}
 */
function Config(appID, settingsDivID, profileCombo) {
	this.PROFILES_KEY = "PROFILES";
	this.appID = appID;
	this.settingsDivID = settingsDivID;
	this.profileCombo = profileCombo;
	this.profiles = [];
	this.currentProfile;
	this.profileSelectionChanged = $.proxy(this.profileSelectionChanged, this);
	$("#" + this.profileCombo).change( this.profileSelectionChanged );
};

/**
 * toggle display of the settings div
 * @returns {undefined}
 */
Config.prototype.toggleConfig = function () {
	$("#" + this.settingsDivID).toggle();
};


Config.prototype.save = function(key, object) {
	console.log("saving " + key + "_" + object);
	localStorage.setItem(this.appID + "_" + key, JSON.stringify(object));
};
Config.prototype.load = function(key) {
	var object = null;
	var s = localStorage.getItem(this.appID + "_" + key);
	if ( s ){
		try {
			object = JSON.parse(s);
			return object;
		}
		catch (e) {
			return null;
		}
	}
};
Config.prototype.delete = function( key ) {
	console.log("deleting " + key);
	localStorage.removeItem(this.appID + "_" + key);
};

Config.prototype.profileSelectionChanged = function(){
//	var profileName = this.selectedOptions[0].text;
	var profileName = $('#' + this.profileCombo + ' option:selected').text();
	console.log("selected: " + profileName);
	this.loadProfile(profileName);
};

/**
 * @param {combobox} the combobox to fill with the profile ids
 * @returns {Function}
 */
Config.prototype.loadProfileNames = function() {
	$('#' + this.profileCombo).empty();
	var profiles = this.load(this.PROFILES_KEY);
	if (profiles != null) {
		var that = this;
		if (Array.isArray(profiles)) {
			profiles.forEach(function(element, index, arr) {
				var x = $('#' + that.profileCombo);
				$('#' + that.profileCombo).append($('<option>', {value: element,text: element} ));
			});
			that.profiles = profiles;
		}
		this.profileSelectionChanged();
	}
	else
		console.log("no valid " + this.PROFILES_KEY + " found in localStorage!");
};

Config.prototype.putProfileName = function(profileName) {
	// update and save list of profile names, if necessary
	if (this.profiles.indexOf(profileName) < 0 ) {
		this.profiles.push(profileName);
		this.save(this.PROFILES_KEY, this.profiles);
	}
};
Config.prototype.removeProfileName = function(profileName) {
	// update and save list of profile names, if necessary
	var index = this.profiles.indexOf(profileName);
	if ( index >= 0 ) {
		this.profiles.splice(index, 1);
		this.save(this.PROFILES_KEY, this.profiles);
	}
};

Config.prototype.saveProfile = function() {
	var profile = {};
	// transfer all values from all text-inputs of the settings div to profile
	$("#" + this.settingsDivID +" :text").each(function(i) {
		profile[$(this).attr('id')] = $(this).val();
	});
	$("#" + this.settingsDivID +" :password").each(function(i) {
		profile[$(this).attr('id')] = $(this).val();
	});
	//  take profileName from profile field, prefixed with appID
	var profileName = $("#" + this.settingsDivID +" #profile").val();
	// save profile
	this.save(profileName, profile);
	// update profile list, if neccessary
	this.putProfileName(profileName);
	// make the saved profile the active one
	this.currentProfile = profileName;
};

Config.prototype.deleteProfile = function() {
	//  take profileName from profile field, prefixed with appID
	var profileName = $("#" + this.settingsDivID +" #profile").val();
	// save profile
	this.delete(profileName);
	// update profile list, if neccessary
	this.removeProfileName(profileName);
	this.loadProfileNames();
};

Config.prototype.loadProfile = function(profileName) {
	console.log("loading profile " + profileName);
	var profile = this.load(profileName);
	if (profile != null )
		for (var key in profile) {
			$("#" + this.settingsDivID +" #" + key).val(profile[key]);
		}
	// make the saved profile the active one
	this.currentProfile = profileName;
};

/**
 * reset config entries from the current profile
 * @returns {undefined}
 */
Config.prototype.resetProfile = function() {
	console.log("resetting profile with " + this.currentProfile);
	this.loadProfile(this.currentProfile);
};



