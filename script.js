var batteryLevel, winds = [], rp, flwint = true, opentrigger;

function updateTime() {
	const now = new Date();
	const hours = now.getHours().toString().padStart(2, '0');
	const minutes = now.getMinutes().toString().padStart(2, '0');
	const seconds = now.getSeconds().toString().padStart(2, '0');

	const timeString = `${hours}:${minutes}:${seconds}`;
	document.getElementById('time-display').innerText = timeString;

	const year = now.getFullYear();
	const month = (now.getMonth() + 1).toString().padStart(2, '0');
	const day = now.getDate().toString().padStart(2, '0');

	const dateString = `${day}-${month}-${year}`;
	document.getElementById('date-display').innerText = dateString;

}
updateTime();
setInterval(updateTime, 1000);


function updateBattery() {
	navigator.getBattery().then(function(battery) {
		// Get the battery level
		batteryLevel = Math.floor(battery.level * 100);

		// Determine the appropriate icon based on battery level
		let iconClass;
		if (batteryLevel >= 75) {
			iconClass = 'battery_full';
		} else if (batteryLevel >= 25) {
			iconClass = 'battery_5_bar';
		} else if (batteryLevel >= 15) {
			iconClass = 'battery_2_bar';
		} else {
			iconClass = 'battery_alert';
		}

		// Check if the value has changed
		if (iconClass !== document.getElementById('battery-display').innerText) {
			// Update the display only if the value changes
			document.getElementById('battery-display').innerHTML = iconClass;
			document.getElementById('battery-p-display').innerHTML = batteryLevel + "%";
		}
	});
}
updateBattery();

navigator.getBattery().then(function(battery) {
	battery.addEventListener('levelchange', updateBattery);
});

function dragElement(elmnt) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	if (document.getElementById(elmnt.id + "header")) {
		// if present, the header is where you move the DIV from:
		document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
	} else {
		// otherwise, move the DIV from anywhere inside the DIV:
		elmnt.onmousedown = dragMouseDown;
	}

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		// get the mouse cursor position at startup:
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		bringToTop(e.target.parentElement)
		elmnt.style.zIndex = ""
		e = e || window.event;
		e.preventDefault();
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		// set the element's new position:
		elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
		elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
	}

	function closeDragElement() {
		// stop moving when mouse button is released:
		document.onmouseup = null;
		document.onmousemove = null;
	}
}

document.getElementById("mm").innerHTML = `<svg class="mmic" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="22.93098" height="43.31773" viewBox="0,0,22.93098,43.31773"><g transform="translate(-228.53451,-158.34114)"><g data-paper-data="{&quot;isPaintingLayer&quot;:true}" fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="0" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" style="mix-blend-mode: normal"><path d="M228.68924,195.01197l-0.15473,-36.67083l19.03116,29.04225l0.00895,-17.05191l3.55036,-5.02752l0.3405,36.35491c0,0 -18.13437,-29.80707 -18.13437,-29.23736c0,5.15736 -0.30946,16.4013 -0.30946,16.4013z"/></g></g></svg>`;

function clwin(x) {
	x.parentElement.parentElement.remove();
}

function flwin(x) {
	if (x.innerHTML == "web_asset") {
		x.parentElement.parentElement.style = "left: 0px; top: 0px; width: 100%; height: calc(100% - 47px);";
		x.innerHTML = "filter_none"
	} else {
		x.parentElement.parentElement.style = "left: calc(50vw - 200px);top: calc(50vh - 135px); width: 381px; height: 227px;"
		x.innerHTML = "web_asset"
	}
}

async function openapp(x) {
	const defapps = ['files', 'settings', 'camera', 'clock']
	if (defapps.includes(x)) {
		const y = await fetchData("/Nova-OS/appdata/"+ x + "/index.html");
		openwindow(x, y)
	} else {
		if (confirm("This app is BETA and may be harmful for your device.\n\nDo you wish to open it?")) {
			const y = await fetchData("/appdata/"+ x + "/index.html");
			openwindow(x, y)
		} else {return}
	}
}

async function fetchData(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const data = await response.text();
		return data;
	} catch (error) {
		console.error("Error fetching data:", error.message);
		const data = "App Launcher: CRITICAL ERROR<br><br><sup>" + error.message + "</sup>";
		return data;
	}
}

function openwindow(title, content) {
	const ismob = window.innerWidth
	if (content == undefined) {
		content = "<center><h1>Unavailable</h1>App Data cannot be read.</center>"
	}
	winds.push("arr" + winds.length)
	// Create the window element
	var windowDiv = document.createElement("div");
	windowDiv.id = "window" + winds.length;
	windowDiv.classList += "window";
	windowDiv.style = "    left: calc(50vw - 200px);top: calc(50vh - 135px); width: 381px; height: 227px;"
	// Create the window header
	var windowHeader = document.createElement("div");
	windowHeader.id = "window" + winds.length + "header";
	windowHeader.classList += "windowheader";
	windowHeader.textContent = toTitleCase(title);

	var flButton = document.createElement("span");
	flButton.classList.add("material-icons", "wincl");
	flButton.style = "right: 20px;font-size: 10px !important;padding: 3px;"
	flButton.textContent = "web_asset";
	flButton.onclick = function() {
		flwin(flButton);
	};

	// Create the close button in the header
	var closeButton = document.createElement("span");
	closeButton.classList.add("material-icons", "wincl");
	closeButton.textContent = "close";
	closeButton.onclick = function() {
		clwin(closeButton);
	};


	// Append the close button to the header
	windowHeader.appendChild(closeButton);

	windowHeader.appendChild(flButton);
	// Create the window content
	var windowContent = document.createElement("div");
	windowContent.classList += "windowcontent";

	// Create an iframe element
	var iframe = document.createElement("iframe");

	// Append the iframe to the window content
	windowContent.appendChild(iframe);

	// Set the source HTML for the iframe
	iframe.onload = function() {
		iframe.contentDocument.write(content);
	};

	// Append the header and content to the window
	windowDiv.appendChild(windowHeader);
	windowDiv.appendChild(windowContent);

	// Append the window to the document body
	document.body.appendChild(windowDiv);
	dragElement(windowDiv)
}

function toTitleCase(str) {
	rp = str
	return str.toLowerCase().replace(/(?:^|\s)\w/g, function(match) {
		return match.toUpperCase();
	});
}

function bringToTop(elementId) {
  const elements = document.querySelectorAll('.window'); // Replace with your common class

  let maxZIndex = 0;

  elements.forEach(element => {
	const zIndex = parseInt(window.getComputedStyle(element).zIndex) || 1;
	maxZIndex = Math.max(maxZIndex, zIndex);
  });

  const targetElement = document.getElementById(elementId);

  if (targetElement) {
	targetElement.style.zIndex = (maxZIndex + 999).toString();
  }
}
