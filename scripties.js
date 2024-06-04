gid("mm").innerHTML = `<svg class="mmic" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="22.93098" height="43.31773" viewBox="0,0,22.93098,43.31773"><g transform="translate(-228.53451,-158.34114)"><g data-paper-data="{&quot;isPaintingLayer&quot;:true}" id='novaic' fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="0" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" style="mix-blend-mode: normal"><path d="M228.68924,195.01197l-0.15473,-36.67083l19.03116,29.04225l0.00895,-17.05191l3.55036,-5.02752l0.3405,36.35491c0,0 -18.13437,-29.80707 -18.13437,-29.23736c0,5.15736 -0.30946,16.4013 -0.30946,16.4013z"/></g></g></svg>`;

var defaultAppIcon = `<?xml version="1.0" encoding="UTF-8"?> <svg version="1.1" viewBox="0 0 76.805 112.36" xmlns="http://www.w3.org/2000/svg"> <g transform="translate(-201.6 -123.82)"> <g stroke-dasharray="" stroke-miterlimit="10" style="mix-blend-mode:normal" data-paper-data='{"isPaintingLayer":true}'> <path d="m201.6 236.18v-111.56h49.097l27.707 31.512v80.051z" fill="#3f7ef6" stroke-width="NaN"/> <path d="m250.82 155.02 0.12178-31.202 27.301 31.982z" fill="#054fff" stroke-width="0"/> <path d="m216.73 180.4h46.531" fill="none" stroke="#9dbaff" stroke-linecap="round" stroke-width="7.5"/> <path d="m216.73 194.37h36.44" fill="none" stroke="#9dbaff" stroke-linecap="round" stroke-width="7.5"/> <path d="m216.73 207.78h42.046" fill="none" stroke="#9dbaff" stroke-linecap="round" stroke-width="7.5"/> </g> </g> </svg>`

function thlog(x) {
	console.log("theme: " + x)
}

// Mode-specific styles
const styles = {
	dark: {
		simple: {
			flodiv: {backgroundColor: "rgb(42, 41, 41)", color: "white", backdropFilter: "none" },
			appdmod: { background: "#333333", color: "white", backdropFilter: "none" },
			searchinpe: { color: "white", backgroundColor: "#2a2929" },
			searchnbtn: { background: "rgb(42, 41, 41)", color: "#878787" },
			bob: { background: "rgb(42, 41, 41)" },
			novaic: { fill: "white" }
		},
		nonSimple: {
			flodiv: {color: "white", backdropFilter: "blur(10px)", backgroundColor: "rgb(0 0 0 / 33%)"},
			appdmod: { background: "#00000091", color: "white", backdropFilter: "blur(14px)" },
			searchinpe: { color: "white", backgroundColor: "rgb(20 20 20)" },
			searchnbtn: { background: "rgb(20 20 20)", color: "#878787" },
			bob: { background: "rgb(20 20 20)" },
			novaic: { fill: "white" }
		}
	},
	bright: {
		simple: {
			flodiv: {backgroundColor: "#e9e9e9", backdropFilter: "none", color: "rgb(91 91 91)"},
			appdmod: { background: "#f2f9ff", color: "rgb(91 91 91)", backdropFilter: "none" },
			searchinpe: { color: "black", backgroundColor: "#e5e5e5" },
			searchnbtn: { background: "rgb(229, 229, 229)", color: "#878787" },
			bob: { background: "#e5e5e5", color: "#1f1f1f" },
			novaic: { fill: "rgb(91 91 91)" }
		},
		nonSimple: {
			flodiv: { backgroundColor: "rgb(255 255 255 / 18%)", color: "white", backdropFilter: "blur(10px)" },
			appdmod: { background: "#7d7d7d73", color: "white", backdropFilter: "blur(14px)" },
			searchinpe: { color: "white", backgroundColor: "rgba(0, 0, 0, 0.13)" },
			searchnbtn: { background: "rgba(0, 0, 0, 0.13)", color: "#878787" },
			bob: { backgroundColor: "rgba(0, 0, 0, 0.13)" },
			novaic: { fill: "white" }
		}
	}
};

// dark mode
function checkdmode() {
	let x = localStorage.getItem("qsets");
	if (x) {
		thlog("qsets found");
		if (JSON.parse(x).darkMode) {
			thlog("yeah dark mode");
			if (JSON.parse(x).simpleMode) {
				thlog("oh its dark simple");
				switchtheme("dark", "simple");
			} else {
				thlog("its non-simple dark");
				switchtheme("dark");
			}
		} else {
			thlog("bright");
			if (JSON.parse(x).simpleMode) {
				thlog("its simple bright");
				switchtheme("bright", "simple");
			} else {
				thlog("its non-simple bright");
				switchtheme("bright");
			}
		}
	}
}

// Common style settings for elementhahas
const setStyle = (element, styles) => {
	if (element) {
		for (const property in styles) {
			element.style[property] = styles[property];
		}
	}
};

const applyStyles = (elementhahas, styles) => {
	elementhahas.forEach(elementhaha => setStyle(elementhaha, styles));
};

function switchtheme(x, y) {
	// elementhahas that need styling
	const flodivelementhahas = document.querySelectorAll('[navobj]');
	const appdmodelementhaha = document.querySelector('#appdmod');
	const searchinpe = document.querySelector('.searchinputcont');
	const searchnbtn = document.querySelector('#strtsearcontbtn');
	const bob = document.querySelector('#bobthedropdown');
	const novaicelementhaha = document.querySelector('#novaic');

	// Determine which styles to apply
	const mode = x === "dark" ? "dark" : "bright";
	const simplicity = y === "simple" ? "simple" : "nonSimple";

	thlog(`setting ${mode} mode ${simplicity === "simple" ? "simple" : "non-simple"}`);

	// Apply styles
	applyStyles(flodivelementhahas, styles[mode][simplicity].flodiv);
	setStyle(appdmodelementhaha, styles[mode][simplicity].appdmod);
	setStyle(searchinpe, styles[mode][simplicity].searchinpe);
	setStyle(searchnbtn, styles[mode][simplicity].searchnbtn);
	setStyle(bob, styles[mode][simplicity].bob);
	novaicelementhaha.setAttribute('fill', styles[mode][simplicity].novaic.fill);
}

// more stuff
function isDark(hexColor) {
	// Remove '#' if present
	hexColor = hexColor.replace('#', '');

	// Convert hex to RGB
	var r = parseInt(hexColor.substring(0,2),16);
	var g = parseInt(hexColor.substring(2,4),16);
	var b = parseInt(hexColor.substring(4,6),16);

	// Calculate luminance
	var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

	// Return true if luminance is less than or equal to 0.5 (considered dark), false otherwise
	return luminance <= 0.5;
}


function terminal() {
	gid("terminal").showModal()
}

function cuteee() {
	let stylelement = document.createElement('style')
	stylelement.innerHTML = `.windowheader {
	background-color: #121212;
	backdrop-filter: blur(5px) brightness(0.5);
	position: absolute;
	padding: 0.3rem 0.8rem;
	border-radius: 0px 0 0 15px;
	padding-bottom: 0.2rem;
	padding-right: 0.3rem;
	right: 0;
	cursor: drag;
	}
	
	.windowcontent iframe {
    border: none;
    width: 100%;
    height: calc(100% - 0px);
}

.windowcontent {
	box-sizing: border-box;
	height: calc(100% - 0px);
}
`
	document.body.appendChild(stylelement)
}