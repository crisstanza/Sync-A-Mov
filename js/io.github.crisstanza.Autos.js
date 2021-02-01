"use strict";

if (!io) var io = {};
if (!io.github) io.github = {};
if (!io.github.crisstanza) io.github.crisstanza = {};
if (!io.github.crisstanza.Autos) io.github.crisstanza.Autos = {};

(function() {

	io.github.crisstanza.Autos.initKey = function(keys) {
		let targetKeys = fixTargetKeys(keys);
		document.body.addEventListener('keyup', function(event) {
			let keyCode = event.keyCode;
			if (targetKeys.includes(keyCode)) {
				onKeyUp(event);
			}
		});
	};

	io.github.crisstanza.Autos.initId = function() {
		let elements = document.querySelectorAll('[id]:not([id=""])');
		if (elements) {
			let length = elements.length;
			for (let i = 0 ; i < length ; i++) {
				let element = elements[i];
				let id = element.getAttribute('id');
				let identifier = fixId(id);
				window[identifier] = element;
			}
		}
		return elements;
	};

	function fixId(str) {
		let parts = str.split('-');
		let length = parts.length;
		for (let i = 0 ; i < length ; i++) {
			let part = parts[i];
			if (i > 0) {
				parts[i] = part.charAt(0).toUpperCase() + part.slice(1);
			}
		}
		let identifier = parts.join('');
		return identifier;
	}

	function firstUppercase(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	function fixTargetKeys(keys) {
		let targetKeys = [];
		let length = keys.length;
		for (let i = 0 ; i < length ; i++) {
			let key = keys[i];
			let type = typeof key;
			if (type == 'string') {
				if (key.length == 1) {
					targetKeys.push(key.charCodeAt(0));
				} else if (key == 'ENTER') {
					targetKeys.push(13);
				} else if (key == 'SPACE') {
					targetKeys.push(32);
				} else if (key == 'ARROWS') {
					targetKeys.push(37, 38, 39, 40);
				}
			}
		}
		return targetKeys;
	}

	function init(event) {
		initAutos(document.body.getAttribute('data-autos'));
		initAutosKeys(document.body.getAttribute('data-autos-keys'));
	}

	function initAutos(autos) {
		if (autos) {
			let parts = autos.split(/, */);
			let length = parts.length;
			for (let i = 0 ; i < length ; i++) {
				let part = parts[i];
				let identifier = firstUppercase(part);
				let js = 'io.github.crisstanza.Autos.init'+identifier+'();';
				eval(js);
			}
		}
	}

	function initAutosKeys(autosKeys) {
		if (autosKeys) {
			let parts = autosKeys.split(/, */);
			let length = parts.length;
			if (length) {
				io.github.crisstanza.Autos.initKey(parts);
			}
		}
	}

	window.addEventListener('load', init);

})();
