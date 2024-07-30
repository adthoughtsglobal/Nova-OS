var issues = ``
const cantusetext = `<h1>Nova won't work here.</h1>
		<p>And that's nothing to worry about!<br>Update your browser, or just move to the better options. </p>
		<p>Try these options:</p>
		<ul>
		<li><a href="https://www.google.com/chrome/">Google Chrome - install</a></li>
		<li><a href="https://www.mozilla.org/en-US/firefox/new/">Firefox - install</a></li>
	</ul><p>This is why you cannot get the best experience: </p><ol>`
	const caniuse2 = `</ol>
	<p>But still, if you wish to continue, press 'OK'. But we are sure this won't give you the best results.</p>`

if (typeof HTMLDialogElement == 'undefined') {
	issues = `<li><b>HTMLDialogElement Not supported: </b> We have taken some efforts to fix this for you.</li>`
	say(cantusetext + issues + caniuse2, "failed")
	// Check if HTMLDialogElement is supported
	if (!window.HTMLDialogElement) {
		// Define custom dialog polyfill
		class HTMLDialogElementPolyfill extends HTMLElement {
			constructor() {
				super();
				this.setAttribute('role', 'dialog');
				this.style.display = 'none';
				document.body.appendChild(this);
			}

			// Method to show the dialog
			showModal() {
				this.style.display = 'block';
			}

			// Method to close the dialog
			close() {
				this.style.display = 'none';
			}
		}

		// Define custom element for dialog
		customElements.define('dialog', HTMLDialogElementPolyfill);
	}
}

if (detectIE()) {
	issues = `<li><b>HTMLDialogElement Not supported: </b> We have taken some efforts to fix this for you.</li>
	<li><b>Internet explorer detected: </b> i dunno what to say ;-;</li>`
	say(cantusetext + issues + caniuse2+ `<b>Anyway, it is so interesting why you still use explorer.</b>`, "failed")
} 

function detectIE() {
	var ua = window.navigator.userAgent;

	// IE 10 and IE 11
	var msie = ua.indexOf('MSIE ');

	// Other IE browsers
	var trident = ua.indexOf('Trident/');

	if (msie > 0 || trident > 0) {
		// IE detected
		return true;
	} else {
		// Not IE
		return false;
	}
}

const exit = function () {
	if (gid("terminal").open) {
		gid("terminal").close()
	}
}