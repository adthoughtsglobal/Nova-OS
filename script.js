var batteryLevel, winds = [], rp, flwint = true, opentrigger, memory, nowapp;

// Check if the database 'trojencat' exists
getdb('trojencat', 'rom')
.then((result) => {
	try {
		if (result !== null) {
			// If the 'rom' key exists, set the 'memory' array to its value
			memory = result;
		} else {
			// If the 'rom' key doesn't exist, assign a random array to the 'memory' list
			memory = [
				// array with all folders
				{
					// folder
					"folderName": "Downloads",
					"content": [
						{
							"fileName": "demo",
							"uid": "sibq81",
							"type": "txt",
							"content": "This is an example of a Nova Pure Text File."
						},
						{
							"fileName": "demo2",
							"uid": "y67njs",
							"type": "txt",
							"content": "Another demo"
						}
					]
				},
				{
					// folder
					"folderName": "Apps",
					"content": []
				}
			];

			// Save the random array to the 'rom' key in the 'trojencat' database
			setdb('trojencat', 'rom', memory);
		}
	} catch (error) {
		console.error('Error in database operations:', error);
	}
})
.catch((error) => {
	console.error('Error retrieving data from the database:', error);
});


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
	bringToTop(elmnt)
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



dod()

async function dod() {
								setTimeout(async function() {
									document.getElementById("desktop").innerHTML = ``;
	  let appslist = await getFileNamesByFolder("Apps")
	appslist.forEach(function(app) {
		// Create a div element for the app shortcut
		var appShortcutDiv = document.createElement("div");
		appShortcutDiv.className = "app-shortcut";
		appShortcutDiv.setAttribute("onclick", "openapp('" + app.name+ "', '"+app.id+"')");

		// Create a span element for the app icon
		var iconSpan = document.createElement("span");
		iconSpan.className = "material-icons app-icon";
		iconSpan.textContent = "rocket_launch";

		// Create a span element for the app name
		var nameSpan = document.createElement("span");
		nameSpan.className = "appname";
		nameSpan.textContent = app.name;

		// Append both spans to the app shortcut container
		appShortcutDiv.appendChild(iconSpan);
		appShortcutDiv.appendChild(nameSpan);

		// Append the app shortcut container to the desktop
		document.getElementById("desktop").appendChild(appShortcutDiv);

	});
							}, 1000);
}

function clwin(x) {
	x.parentElement.parentElement.remove();
}

function flwin(x) {
	x.parentElement.parentElement.classList.add("transp2")
	if (x.innerHTML == "web_asset") {
		x.parentElement.parentElement.style = "left: 0px; top: 0px; width: 100%; height: calc(100% - 47px);";
		x.innerHTML = "filter_none"
	} else {
		x.parentElement.parentElement.style = "left: calc(50vw - 200px);top: calc(50vh - 135px); width: 381px; height: 227px;"
		x.innerHTML = "web_asset"
	}
	setTimeout(() => {
	  x.parentElement.parentElement.classList.remove("transp2")
	}, 1000);

}

async function openapp(x, od) {
	dod()
	if (document.getElementById('appdmod').open) {
		document.getElementById('appdmod').close()
	}


	// opening an app
	const fetchDataAndSave = async (x) => {
		try {
			let m = await getFileNamesByFolder("Apps");

			var y;
			if (od != 1) {
				y = await getFileById(od)
				y = y.content
			} else {
				y = await fetchData("/Nova-OS/appdata/" + x + ".html");
				await createFile("Apps", x, "app", y);
			}

			// Assuming you have a predefined function openwindow
			openwindow(x, y);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	// Call fetchDataAndSave with the desired value of x
	fetchDataAndSave(x);
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
var content
function openwindow(title, cont) {
	content = cont
	const ismob = window.innerWidth;
	if (content == undefined) {
		content = "<center><h1>Unavailable</h1>App Data cannot be read.</center>";
	}
	winds.push("arr" + winds.length);

	// Create the window element
	var windowDiv = document.createElement("div");
	windowDiv.id = "window" + winds.length;
	windowDiv.onclick = nowapp = title
	windowDiv.classList += "window";
	// Generate random values
	var randomRight = Math.random() * (20 - 1) + 1 + 'vw';
	var randomTop = Math.random() * (6 - 1) + 1 + 'vh';

	let isitmob = window.innerWidth <= 400;

	// Set the style of windowDiv
	if (!isitmob) {
		windowDiv.style.left = randomRight;
		windowDiv.style.top = randomTop;
	} else {
		windowDiv.style.left = 0;
		windowDiv.style.top = 0;
	}
	if (!isitmob) {
		windowDiv.style.width = '449px';
		windowDiv.style.height = '274px';
	} else {
		windowDiv.style.width = '100%';
		windowDiv.style.height = 'calc(100% - 0px)';
	}

	// Create the window header
	var windowHeader = document.createElement("div");
	windowHeader.id = "window" + winds.length + "header";
	windowHeader.classList += "windowheader";
	windowHeader.textContent = toTitleCase(title);

	
	if (!isitmob) {
	var flButton = document.createElement("span");
	flButton.classList.add("material-icons", "wincl");
	flButton.style = "right: 20px;font-size: 10px !important;padding: 3px;";
	flButton.textContent = "web_asset";
	flButton.onclick = function() {
		flwin(flButton);
	};
	}

	// Create the close button in the header
	var closeButton = document.createElement("span");
	closeButton.classList.add("material-icons", "wincl");
	closeButton.textContent = "close";
	closeButton.onclick = function() {
		clwin(closeButton);
	};

	// Append the close button to the header
	windowHeader.appendChild(closeButton);
	if (!isitmob){windowHeader.appendChild(flButton);}
	

	// Create the window content
	var windowContent = document.createElement("div");
	windowContent.classList += "windowcontent";

	// Create an iframe element
	var iframe = document.createElement("iframe");

	// Append the iframe to the window content
	windowContent.appendChild(iframe);

	// Set the source HTML for the iframe
	iframe.onload = function() {
		// Find all script tags in content 
		content = content
		var scriptTags = content.match(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi);

		// Loop through each script tag
		scriptTags.forEach(function(scriptTag) {
			// Create a new script element
			var script = iframe.contentDocument.createElement('script');

			// Extract content from script tag
			var scriptContent = scriptTag.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/i, "$1");

			// Set innerHTML with content scripts
			script.innerHTML = scriptContent;

			// Append the new script to iframe document head
			iframe.contentDocument.head.appendChild(script);
		});

		// Remove all script tags from content
		var contentWithoutScripts = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

		// Set the iframe content without original scripts
		iframe.contentDocument.body.innerHTML = contentWithoutScripts;

		// Execute a function in the iframe content (change this function to fit your needs)
		iframe.contentWindow.greenflag();
	};

	// Append the header and content to the window
	windowDiv.appendChild(windowHeader);
	windowDiv.appendChild(windowContent);

	// Append the window to the document body
	document.body.appendChild(windowDiv);
	dragElement(windowDiv);
}


function toTitleCase(str) {
	rp = str
	return str.toLowerCase().replace(/(?:^|\s)\w/g, function(match) {
		return match.toUpperCase();
	});
}

function bringToTop(elementId) {
	
}

function openlaunchprotocol(x, y) {
	x = {
		"appname": x,
		"data": y
	}
	localStorage.setItem("todo", JSON.stringify(x))
	openapp(x.appname, 1)
}

function bringToTop(element) {
	
}

function getMaxZIndex() {
	// Get the maximum z-index of all elements
	const elements = document.querySelectorAll('.window');
	let maxZIndex = 0;

	elements.forEach(element => {
		const zIndex = parseInt(window.getComputedStyle(element).zIndex);
		if (zIndex > maxZIndex) {
			maxZIndex = zIndex;
		}
	});
}

function genUID() {
	const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let randomString = '';
	for (let i = 0; i < 6; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		randomString += characters.charAt(randomIndex);
	}
	return randomString;
}

async function createFolder(folderName) {
	try {
		let memory = await getdb('trojencat', 'rom');

		// Check if the folder already exists
		const folderIndex = memory.findIndex(folder => folder.folderName === folderName);

		if (folderIndex === -1) {
			// If the folder does not exist, create it
			memory.push({
				folderName,
				content: []
			});
			console.log(`Folder "${folderName}" created.`);
			setdb('trojencat', 'rom', memory);
		} else {
			console.log(`Folder "${folderName}" already exists.`);
		}
	} catch (error) {
		console.error("Error creating folder:", error);
	}
}


async function createFile(folderName, fileName, type, content) {
	try {
		if (type === "app") {
			let x = await getFileNamesByFolder("Apps");

			if (x.some(obj => obj.name === fileName)) {
				console.log("0001");
				dod()
				return;
			}
		}

		let memory = await getdb('trojencat', 'rom');
		const folderIndex = memory.findIndex(folder => folder.folderName === folderName);

		// Check if the folder exists
		if (folderIndex !== -1) {
			// Push the new file object to the folder's content array
			let uid = genUID();
			memory[folderIndex].content.push({
				fileName,
				uid,
				type,
				content
			});
			console.log(`0002 FN: "${fileName}" @ "${folderName}"`);
			setdb('trojencat', 'rom', memory);
		} else {
			// If the folder does not exist, create the folder and retry file creation
			console.log("Creating folder@")
			await createFolder(folderName);
			await createFile(folderName, fileName, type, content);
			dod()
			return;
		}
	} catch (error) {
		console.error("Error fetching data:", error);
		return null;
	}
}


async function getFileById(x) {
	try {
		let memory = await getdb('trojencat', 'rom');
		for (const folder of memory) {
			for (const item of folder.content) {
				if (item.uid === x) {
					return item;
				}
			}
		}
		return null;
	} catch (error) {
		console.error("Error fetching data:", error);
		return null;
	}
}



// april fools - but its january.
function hackAllData() {
	console.log("Gathering data...");
	console.log("You just too dumb to try hack nova.")
	console.log("Nova OS Keeps your data safer from hackers like.... uh.... you?")
	if (tom) {
		tom = undefined;
		console.log()
		console.log("Nova OS Keeps your data safer from hackers like.... uh.... you?")
	}
}

document.body.style.backgroundImage = `url("https://media.discordapp.net/attachments/1194915269869588501/1196721804870438922/photo-1622547748225-3fc4abd2cca0.png")`;

var myDialog = document.getElementById('appdmod');

document.addEventListener('click', (event) => {
	if (event.target === myDialog) {
		myDialog.close();
	}
});

async function getFileNamesByFolder(folderName) {
	try {
		var memory = await getdb('trojencat', 'rom');
		const filesInFolder = [];

		for (const folder of memory) {
			if (folder.folderName === folderName) {
				for (const item of folder.content) {
					filesInFolder.push({ id: item.uid, name: item.fileName });
				}
				break;
			}
		}

		return filesInFolder;
	} catch (error) {
		console.error("Error fetching data:", error);
		return null;
	}
}

function justConfirm(message) {
  return new Promise((resolve) => {
	const modal = document.createElement('div');
	modal.classList.add('modal');

	const modalContent = document.createElement('div');
	modalContent.classList.add('modal-content');

	const promptMessage = document.createElement('p');
	promptMessage.textContent = message;
	modalContent.appendChild(promptMessage);

	const yesButton = document.createElement('button');
	yesButton.textContent = 'Yes';
	yesButton.addEventListener('click', () => {
	  document.body.removeChild(modal);
	  resolve(true);
	});
	modalContent.appendChild(yesButton);

	const noButton = document.createElement('button');
	noButton.textContent = 'No';
	noButton.addEventListener('click', () => {
	  document.body.removeChild(modal);
	  resolve(false);
	});
	modalContent.appendChild(noButton);

	modal.appendChild(modalContent);
	document.body.appendChild(modal);
  });
}

function ask(message) {
  return new Promise((resolve) => {
	const modal = document.createElement('div');
	modal.classList.add('modal');

	const modalContent = document.createElement('div');
	modalContent.classList.add('modal-content');

	const promptMessage = document.createElement('p');
	promptMessage.textContent = message;
	modalContent.appendChild(promptMessage);

	const inputField = document.createElement('input');
	inputField.type = 'text';
	modalContent.appendChild(inputField);

	const yesButton = document.createElement('button');
	yesButton.textContent = 'Yes';
	yesButton.addEventListener('click', () => {
	  const userInput = inputField.value;
	  document.body.removeChild(modal);
	  resolve({ confirmed: true, userInput });
	});
	modalContent.appendChild(yesButton);

	const noButton = document.createElement('button');
	noButton.textContent = 'No';
	noButton.addEventListener('click', () => {
	  document.body.removeChild(modal);
	  resolve({ confirmed: false, userInput: null });
	});
	modalContent.appendChild(noButton);

	modal.appendChild(modalContent);
	document.body.appendChild(modal);
  });
}
