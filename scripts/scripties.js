gid("mm").innerHTML = `<svg class="mmic" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="22.93098" height="43.31773" viewBox="0,0,22.93098,43.31773"><g transform="translate(-228.53451,-158.34114)"><g data-paper-data="{&quot;isPaintingLayer&quot;:true}" id='novaic' fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="0" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" style="mix-blend-mode: normal"><path d="M228.68924,195.01197l-0.15473,-36.67083l19.03116,29.04225l0.00895,-17.05191l3.55036,-5.02752l0.3405,36.35491c0,0 -18.13437,-29.80707 -18.13437,-29.23736c0,5.15736 -0.30946,16.4013 -0.30946,16.4013z"/></g></g></svg>`;

var defaultAppIcon = `<?xml version="1.0" encoding="UTF-8"?> <svg version="1.1" viewBox="0 0 76.805 112.36" xmlns="http://www.w3.org/2000/svg"> <g transform="translate(-201.6 -123.82)"> <g stroke-dasharray="" stroke-miterlimit="10" style="mix-blend-mode:normal" data-paper-data='{"isPaintingLayer":true}'> <path d="m201.6 236.18v-111.56h49.097l27.707 31.512v80.051z" fill="#3f7ef6" stroke-width="NaN"/> <path d="m250.82 155.02 0.12178-31.202 27.301 31.982z" fill="#054fff" stroke-width="0"/> <path d="m216.73 180.4h46.531" fill="none" stroke="#9dbaff" stroke-linecap="round" stroke-width="7.5"/> <path d="m216.73 194.37h36.44" fill="none" stroke="#9dbaff" stroke-linecap="round" stroke-width="7.5"/> <path d="m216.73 207.78h42.046" fill="none" stroke="#9dbaff" stroke-linecap="round" stroke-width="7.5"/> </g> </g> </svg>`;

var globalmimeDb = null;

// Mode-specific styles
const styles = {
	dark: {
		simple: {
			flodiv: { backgroundColor: "rgb(42, 41, 41)", color: "white", backdropFilter: "none" },
			appdmod: { background: "#333333", color: "white", backdropFilter: "none" },
			searchinpe: { color: "white", backgroundColor: "#2a2929" },
			searchnbtn: { background: "rgb(42, 41, 41)", color: "#878787" },
			bob: { background: "rgb(42, 41, 41)" },
			novaic: { fill: "white" }
		},
		nonSimple: {
			flodiv: { color: "white", backdropFilter: "blur(10px)", backgroundColor: "rgb(0 0 0 / 33%)" },
			appdmod: { background: "#00000091", color: "white", backdropFilter: "blur(14px) grayscale(0.5)" },
			searchinpe: { color: "white", backgroundColor: "rgb(20 20 20)" },
			searchnbtn: { background: "rgb(20 20 20)", color: "#878787" },
			bob: { background: "rgb(20 20 20)" },
			novaic: { fill: "white" }
		}
	},
	bright: {
		simple: {
			flodiv: { backgroundColor: "#e9e9e9", backdropFilter: "none", color: "rgb(91 91 91)" },
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

async function checkdmode() {
		// scalable UI
		if (await getSetting("UISizing") && await getSetting("UISizing") == 1) {
			scaleUIElements(await getSetting("UISizing"))
		}

		if (await getSetting("darkMode")) {
			if (await getSetting("simpleMode")) {
				switchtheme("dark", "simple");
			} else {
				switchtheme("dark");
			}
		} else {
			if (await getSetting("simpleMode")) {
				switchtheme("bright", "simple");
			} else {
				switchtheme("bright");
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
	const searhwielementhaha = document.querySelector('#searchwindow');
	const searchinpe = document.querySelector('.searchinputcont');
	const searchnbtn = document.querySelector('#strtsearcontbtn');
	const bob = document.querySelector('#bobthedropdown');
	const novaicelementhaha = document.querySelector('#novaic');

	// Determine which styles to apply
	const mode = x === "dark" ? "dark" : "bright";
	const simplicity = y === "simple" ? "simple" : "nonSimple";

	// Apply styles
	const currentStyles = styles[mode][simplicity];
	applyStyles(flodivelementhahas, currentStyles.flodiv);
	setStyle(appdmodelementhaha, currentStyles.appdmod);
	setStyle(searhwielementhaha, currentStyles.appdmod); // Apply the same styles as appdmodelementhaha
	setStyle(searchinpe, currentStyles.searchinpe);
	setStyle(searchnbtn, currentStyles.searchnbtn);
	setStyle(bob, currentStyles.bob);
	novaicelementhaha.setAttribute('fill', currentStyles.novaic.fill);
}

// more stuff
function isDark(hexColor) {
	// Remove '#' if present
	hexColor = hexColor.replace('#', '');

	// Convert hex to RGB
	var r = parseInt(hexColor.substring(0, 2), 16);
	var g = parseInt(hexColor.substring(2, 4), 16);
	var b = parseInt(hexColor.substring(4, 6), 16);

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

const originalFetch = window.fetch;
window.fetch = async function (...args) {
	console.log('NovaOS Fetch:', ...args);
	return originalFetch.apply(this, args);
};

function scaleUIElements(scaleFactor) {
	var elements = document.querySelectorAll('.scalableui');

	elements.forEach(function (element) {
		element.style.zoom = scaleFactor;
	});
}

async function checkAndRunFromURL() {
	const params = new URLSearchParams(window.location.search);

	const run = params.get('run');

	if (run === 'erdbsfull') {
		let x = await justConfirm("Reset all your data?", "The link you opened NovaOS had a param to erase your device. Do this only if its instructed to do so by NovaOS developers.");
		if (x) {
			erdbsfull();
		}
	}

	const filePath = params.get('path');
  
  if (filePath) {
    console.log(`Opening NovaOS path: ${filePath}`);
    
    onstartup.push(async () => {
		let fileid = await getFileByPath(filePath);
		openfile(fileid.id);
	});
  }
}
const hardcodedMimeTypes = {
    'html': 'text/html',
    'js': 'application/javascript',
    'css': 'text/css',
    'json': 'application/json',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
	'webp': 'image/webp',
    'png': 'image/png',
    'gif': 'image/gif',
    'txt': 'text/plain',
    'pdf': 'application/pdf',
};

async function getMimeType(extension) {
    if (globalmimeDb == null) {
        const mimeDbUrl = 'https://cdn.jsdelivr.net/npm/mime-db@1.52.0/db.json';
        try {
            const responseformimedb = await fetch(mimeDbUrl);
            if (!responseformimedb.ok) throw new Error('Network response was not ok');
            globalmimeDb = await responseformimedb.json();
        } catch (error) {
            return hardcodedMimeTypes[extension] || 'application/octet-stream';
        }
    }
    for (const [key, value] of Object.entries(globalmimeDb)) {
        if (value.extensions && value.extensions.includes(extension)) {
            return key;
        }
    }
    return 'application/octet-stream';
}

function useNovaOffline() {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('sw.js', { scope: '/' })
		  .then((registration) => {
			console.log('Service Worker registered with scope:', registration.scope);
		  })
		  .catch((error) => {
			console.log('Service Worker registration failed:', error);
		  });
	  }
}

function getReadableTimestamp() {
	const now = new Date();
	const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
	const date = now.toLocaleDateString();
	return `${time} ${date}`;
}

const draggableTimeDiv = document.getElementById('draggable-time');
draggableTimeDiv.addEventListener('dragstart', (e) => {
	e.dataTransfer.setData('text/plain', getReadableTimestamp());
});

const roturExtension = new RoturExtension();

document.querySelectorAll('.tooltip').forEach(tooltip => {
    tooltip.addEventListener('mousemove', (e) => {
        const tooltipText = tooltip.querySelector('.tooltiptext');
        const moveX = e.offsetX * 0.3;
        const moveY = e.offsetY * 0.3;
        tooltipText.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
    tooltip.addEventListener('mouseleave', () => {
        tooltip.querySelector('.tooltiptext').style.transform = 'translate(0, 0)';
    });
});