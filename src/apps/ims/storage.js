var STORAGE_PREFIX = "";

function loadSettings() {
	setFieldFromLocalStorage("private_ID", STORAGE_PREFIX);
	setFieldFromLocalStorage("public_ID", STORAGE_PREFIX);
	setFieldFromLocalStorage("realm", STORAGE_PREFIX);
	setFieldFromLocalStorage("proxy_host", STORAGE_PREFIX);
	setFieldFromLocalStorage("proxy_port", STORAGE_PREFIX);
	setFieldFromLocalStorage("pass", STORAGE_PREFIX);
	setFieldFromLocalStorage("stun", STORAGE_PREFIX);
	setFieldFromLocalStorage("turn", STORAGE_PREFIX);
	setFieldFromLocalStorage("turn_user", STORAGE_PREFIX);
	setFieldFromLocalStorage("turn_pass", STORAGE_PREFIX);
	setFieldFromLocalStorage("callee", STORAGE_PREFIX);
}

function saveSettings() {
	saveFieldToLocalStorage("private_ID", STORAGE_PREFIX);
	saveFieldToLocalStorage("public_ID", STORAGE_PREFIX);
	saveFieldToLocalStorage("realm", STORAGE_PREFIX);
	saveFieldToLocalStorage("proxy_host", STORAGE_PREFIX);
	saveFieldToLocalStorage("proxy_port", STORAGE_PREFIX);
	saveFieldToLocalStorage("pass", STORAGE_PREFIX);
	saveFieldToLocalStorage("stun", STORAGE_PREFIX);
	saveFieldToLocalStorage("turn", STORAGE_PREFIX);
	saveFieldToLocalStorage("turn_user", STORAGE_PREFIX);
	saveFieldToLocalStorage("turn_pass", STORAGE_PREFIX);
	saveFieldToLocalStorage("callee", STORAGE_PREFIX);
}

function setFieldFromLocalStorage( id, prefix ) {
	var value = localStorage.getItem(prefix + id);
	if ( typeof value !== "undefined")
		$("#" + id).val(value);
}

function saveFieldToLocalStorage( id, prefix ) {
	localStorage.setItem(prefix + id, $("#" + id).val());
}

function handlePrefixChange(prefix) {
	STORAGE_PREFIX = prefix;
	loadSettings();
}
