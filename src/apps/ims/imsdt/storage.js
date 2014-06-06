function loadSettings() {
	setFieldFromLocalStorage("my_ID");
	setFieldFromLocalStorage("realm");
	setFieldFromLocalStorage("proxy_host");
	setFieldFromLocalStorage("proxy_port");
	setFieldFromLocalStorage("pass");
	setFieldFromLocalStorage("stun");
	setFieldFromLocalStorage("turn");
	setFieldFromLocalStorage("turn_user");
	setFieldFromLocalStorage("turn_pass");
	setFieldFromLocalStorage("callee");
}

function saveSettings() {
	saveFieldToLocalStorage("my_ID");
	saveFieldToLocalStorage("realm");
	saveFieldToLocalStorage("proxy_host");
	saveFieldToLocalStorage("proxy_port");
	saveFieldToLocalStorage("pass");
	saveFieldToLocalStorage("stun");
	saveFieldToLocalStorage("turn");
	saveFieldToLocalStorage("turn_user");
	saveFieldToLocalStorage("turn_pass");
}

function setFieldFromLocalStorage( id ) {
	var value = localStorage.getItem(id);
	if ( value )
		$("#" + id).val(value);
}

function saveFieldToLocalStorage( id ) {
	localStorage.setItem(id, $("#" + id).val());
}
