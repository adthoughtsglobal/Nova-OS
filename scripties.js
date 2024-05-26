gid("mm").innerHTML = `<svg class="mmic" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="22.93098" height="43.31773" viewBox="0,0,22.93098,43.31773"><g transform="translate(-228.53451,-158.34114)"><g data-paper-data="{&quot;isPaintingLayer&quot;:true}" id='novaic' fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="0" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" style="mix-blend-mode: normal"><path d="M228.68924,195.01197l-0.15473,-36.67083l19.03116,29.04225l0.00895,-17.05191l3.55036,-5.02752l0.3405,36.35491c0,0 -18.13437,-29.80707 -18.13437,-29.23736c0,5.15736 -0.30946,16.4013 -0.30946,16.4013z"/></g></g></svg>`;

// Declare variables for elements
const flodivElements = document.querySelectorAll('[navobj]');
const appdmodElement = document.getElementById("appdmod");
const novaicElement = document.getElementById('novaic');
const searchinpe = document.getElementById('strtsear');
const searchnbtn = document.getElementById('strtsearcontbtn');

function thlog(x) {
	console.log("theme: " + x)
}

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

function switchtheme(x, y) {
	if (x == "dark") {
		thlog("setting ns dark mode");
		// dark mode
		flodivElements.forEach(element => {
			element.style.background = "rgb(0 0 0 / 28%)";
		});
		appdmodElement.style.background = "#00000091";
		searchinpe.style.color = "white";
		searchinpe.style.backgroundColor = "#2a2929";
		searchnbtn.style.background = "rgba(0, 0, 0, 0.13)"
		searchnbtn.style.color = "#878787"
	} else {
		thlog("settings ns bright mode");
		// bright mode
		flodivElements.forEach(element => {
			element.style.background = "#67676714";
		});
		appdmodElement.style.background = "#7d7d7d73";
		searchinpe.style.color = "black";
		searchinpe.style.backgroundColor = "#e5e5e5";
	}

	if (y == "simple") {
		// simple
		thlog("setting simple foldivs");
		flodivElements.forEach(element => {
			element.style.backdropFilter = "none";
			if (x == "dark") {
				// simple dark
				element.style.background = "#333333";
				element.style.color = "white";
			} else {
				// simple bright
				element.style.background = "#f2f9ff";
				element.style.color = "rgb(91 91 91)";
			}
		});
		
		if (x === "dark") {
			thlog("setting simple dark");
			novaicElement.setAttribute('fill', 'white');
			appdmodElement.style.backdropFilter = "none";
			appdmodElement.style.background = "#333333";
			appdmodElement.style.color = "white";
			searchnbtn.style.background = "rgb(42, 41, 41)"
			searchnbtn.style.color = "#878787"
		} else {
			thlog("setting simple bright");
			novaicElement.setAttribute('fill', 'rgb(91 91 91)');
			appdmodElement.style.backdropFilter = "none";
			appdmodElement.style.background = "#f2f9ff";
			appdmodElement.style.color = "rgb(91 91 91)";
			searchnbtn.style.background = "rgb(229, 229, 229)"
			searchnbtn.style.color = "#878787"
		}
	} else if (x != "dark") {
		thlog("flodiv for no-mode");
		// non-simple
		flodivElements.forEach(element => {
			element.style.backdropFilter = "blur(10px)";
			element.style.color = "white";
			element.style.backgroundColor = "rgb(157 157 157 / 16%)";
		});
		novaicElement.setAttribute('fill', 'white');
		appdmodElement.style.backdropFilter = "blur(14px)";
		appdmodElement.style.color = "white";
		searchinpe.style.color = "rgb(255 255 255)";
		searchinpe.style.backgroundColor = "rgba(0, 0, 0, 0.13)";
			searchnbtn.style.color = "rgb(255 255 255)";
			searchnbtn.style.backgroundColor = "rgba(0, 0, 0, 0.13)";
		
	}
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
