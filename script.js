var batteryLevel, winds = [], rp, flwint = true, opentrigger, memory, nowapp, stx = document.getElementById("startuptx"), applogs = {}, fulsapp;

// Check if the database 'trojencat' exists
getdb('trojencat', 'rom')
	.then(async (result) => {
		try {
			if (result !== null) {
				memory = result;
				let folders = await window.parent.getFolderNames();
				if (!folders.includes("Desktop")) {
					createFolder("Desktop")
				}
			} else {
				document.getElementById("startup").showModal();
				stx.innerHTML = "Preparing memory"
				// If the 'rom' key doesn't exist, assign a random array to the 'memory' list
				memory = [
					// array with all folders
					{
						// folder
						"folderName": "Downloads",
						"content": [
							{
								"fileName": "Welcome",
								"uid": "sibq81",
								"type": "txt",
								"content": "Welcome to Nova OS! Thank you for using this OS, we believe that we have made this 'software' as the most efficient for your daily usage. If not, kindly reach us https://adthoughtsglobal.github.io and connect via the available options, we will respond you back! Enjoy!"
							},
							{
								"fileName": "Basic Help",
								"uid": "y67njs",
								"type": "txt",
								"content": "Please visit the Nova wiki page on GitHub to learn how to use Nova if you seem to struggle using it. You can find it at: https://github.com/adthoughtsglobal/Nova-OS/wiki/"
							}
						]
					},
					{
						"folderName": "Apps",
						"content": []
					},
					{
						"folderName": "Desktop",
						"content": []
					}
				];

				// Save the default array to the 'rom' key in the 'trojencat' database
				setdb('trojencat', 'rom', memory);
				initialiseOS()
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

async function openn() {
	let x = await getFileNamesByFolder("Apps");
	x.forEach(function(app) {
		// Create a div element for the app shortcut
		var appShortcutDiv = document.createElement("div");
		appShortcutDiv.className = "app-shortcut";
		appShortcutDiv.setAttribute("onclick", "openapp('" + app.name + "', '" + app.id + "')");

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

		document.getElementById("appsindeck").appendChild(appShortcutDiv);
	})
	document.getElementById('appdmod').showModal()
}

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
		let appslist = await getFileNamesByFolder("Desktop")
		appslist.forEach(function(app) {
			// Create a div element for the app shortcut
			var appShortcutDiv = document.createElement("div");
			appShortcutDiv.className = "app-shortcut";
			appShortcutDiv.setAttribute("onclick", "openapp('" + app.name + "', '" + app.id + "')");

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
	console.log("who said pasta?: " + x.parentElement.getElementsByClassName("wincl")[1].innerHTML)
	// if (x.parentElement.getElementsByClassName("wincl")[1].innerHTML == "filter_none") {
//		fulsapp = true;
//		checktaskbar()
//	}
	x.parentElement.parentElement.remove();
}

function flwin(x) {
	x.parentElement.parentElement.classList.add("transp2")
	if (x.innerHTML == "web_asset") {
			x.parentElement.parentElement.style = "left: 0px; top: 0px; width: 100%; height: calc(100% - 47px);";
		x.innerHTML = "filter_none";
		fulsapp = true;
	} else {
		
		x.parentElement.parentElement.style = "left: calc(50vw - 200px);top: calc(50vh - 135px); width: 381px; height: 227px;"
		x.innerHTML = "web_asset"
		fulsapp = false;
	}
	checktaskbar()
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
				y = unshrinkbsf(y.content)
			} else {
				y = await fetchData("/appdata/" + x + ".html");
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

	let isitmob = window.innerWidth <= 500;

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
		windowDiv.style.height = 'calc(100% - 42px)';
	}

	// Create the window header
	var windowHeader = document.createElement("div");
	windowHeader.id = "window" + winds.length + "header";
	windowHeader.classList += "windowheader";
	windowHeader.textContent = toTitleCase(title);

		var flButton = document.createElement("span");
		flButton.classList.add("material-icons", "wincl");
		flButton.style = "right: 20px;font-size: 10px !important;padding: 3px;";
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
	if (!isitmob) { windowHeader.appendChild(flButton); }


	// Create the window content
	var windowContent = document.createElement("div");
	windowContent.classList += "windowcontent";

	// Create an iframe element
	var iframe = document.createElement("iframe");

	// Append the iframe to the window content
	windowContent.appendChild(iframe);

	// Set the source HTML for the iframe
	iframe.onload = function() {
		if (content.includes("<script")) {
			// Find all script tags in content 
			var scriptTags = content.match(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi);

			// Loop through each script tag
			scriptTags.forEach(function(scriptTag) {
				// Create a new script element
				var script = iframe.contentDocument.createElement('script');

				// Check if the script tag has a src attribute (external JavaScript file)
				var srcMatch = scriptTag.match(/src="([^"]+)"/);
				if (srcMatch) {
					// If it's an external script, set the src attribute
					var src = srcMatch[1];
					script.src = src;
				} else {
					// If it's an inline script, extract content from script tag
					var scriptContent = scriptTag.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/i, "$1");
					// Set innerHTML with content scripts
					script.innerHTML = scriptContent;
				}

				// Append the new script to iframe document head
				iframe.contentDocument.head.appendChild(script);
			});

			// Remove all script tags from content
			var contentWithoutScripts = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

			// Set the iframe content without original scripts
			iframe.contentDocument.body.innerHTML = contentWithoutScripts;

			// Execute a function in the iframe content (change this function to fit your needs)
			iframe.contentWindow.greenflag();

		}
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
			console.log(`We proudly proclaim that the folder "${folderName}" created and have created a new chapter in the history of modern mankind.`);
			setdb('trojencat', 'rom', memory);
		} else {
			console.log(`Folder "${folderName}" says that im not dead! what de hail!`);
		}
	} catch (error) {
		console.error("Error creating folder:", error);
	}
}


async function createFile(folderName, fileName, type, content, metadata) {
	if (metadata == undefined) {
		metadata = {"via":"nope"}
	}
	let memory = await getdb('trojencat', 'rom');
	const folderIndex = memory.findIndex(folder => folder.folderName === folderName);
	try {
		if (type === "app") {
			let x = await getFileNamesByFolder("Apps");
			
			if (x.some(obj => obj.name === fileName)) {
				console.log("0001");
				console.log("*Ignores the data* Overwriting...")
				let uid = genUID();
				memory[folderIndex].content.push({
					fileName,
					uid,
					type,
					content,
					metadata
				});
				console.log(`0002 FN: "${fileName}" @ "${folderName}". Did you even know what that means?`);
				return;
			}
			content = shrinkbsf(content)
			dod()
		}

		

		// Check if the folder exists
		if (folderIndex !== -1) {
			// Push the new file object to the folder's content array
			let uid = genUID();
			console.log("The preface of the constitution of the file says that it is "+metadata)
			metadata.datetime = getfourthdimension();
			metadata = JSON.stringify(metadata);
			
			memory[folderIndex].content.push({
				fileName,
				uid,
				type,
				content,
				metadata
			});
			console.log(`0002 FN: "${fileName}" @ "${folderName}" Yay!`);
			setdb('trojencat', 'rom', memory);
		} else {
			console.log("Im making a folder anyway, if you wanna know...")
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
	console.log("You just too dumb to try hack nova?")
	console.log(":skull-emoji:")
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

function justConfirm(title, message, modal) {
	return new Promise((resolve) => {
		if (!modal) {
			modal = document.createElement('dialog');
			modal.classList.add('modal');
			modal.id = "NaviconfDia";
		}

		const modalContent = document.createElement('div');
		modalContent.classList.add('modal-content');
		const bigtitle = document.createElement('h1');
		bigtitle.textContent = title;
		modalContent.appendChild(bigtitle);

		const promptMessage = document.createElement('p');
		promptMessage.innerHTML = message;
		modalContent.appendChild(promptMessage);

		let buttonContainer = modal.querySelector('.button-container');
		if (!buttonContainer) {
			buttonContainer = document.createElement('div');
			buttonContainer.classList.add('button-container');
			buttonContainer.style.display = 'flex';
			modalContent.appendChild(buttonContainer);
		} else {
			buttonContainer.innerHTML = ''; // Clear existing buttons
		}

		const yesButton = document.createElement('button');
		yesButton.textContent = 'Yes';
		yesButton.addEventListener('click', () => {
			modal.close();
			resolve(true);
		});
		buttonContainer.appendChild(yesButton);

		const noButton = document.createElement('button');
		noButton.textContent = 'No';
		noButton.addEventListener('click', () => {
			modal.close();
			resolve(false);
		});
		buttonContainer.appendChild(noButton);

		modal.appendChild(modalContent);
		if (!modal.open) {
			document.body.appendChild(modal);
		}
		modal.showModal();
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

var dev;

// Compression
function shrinkbsf(str) {

	const compressed = pako.deflate(str, { to: 'string' });
	return compressed;
}

// Decompression
function unshrinkbsf(compressedStr) {
	try {
		return pako.inflate(compressedStr, { to: 'string' });
	} catch (error) {
		console.error("Error occurred during decompression:", error);
		return compressedStr;
	}
}

async function makewall(deid) {
	console.log("dod just quacks. He then says: " + deid)
	let x = await getFileById(deid);
	x = x.content
	console.log("or is it? " + x)
	x = unshrinkbsf(x)
	document.body.style.backgroundImage = `url("` + x + `")`;
}

function reloadTaskbar() {
	let x = localStorage.getItem("sets");
	document.getElementById("dock").innerHTML = x;
}

function initialiseOS() {
	stx.innerHTML = "Installing System Apps (0%)";

	let defappsli = [
		"camera",
		"clock",
		"files",
		"media",
		"settings",
		"store",
		"text",
		"studio",
		"gallery"
	];

	function fetchFileWithInterval(i) {
		const filePath = "/appdata/" + defappsli[i] + ".html";

		fetch(filePath)
			.then(response => response.text())
			.then(fileContent => {
				stx.innerHTML = "Installing System Apps (" + Math.round(i / defappsli.length * 100) + "%)";
				createFile("Apps", defappsli[i], "app", fileContent);

				// If there are more files to fetch, schedule the next fetch
				if (i < defappsli.length - 1) {
					setTimeout(() => fetchFileWithInterval(i + 1), 200); // Delay of 0.2 seconds
				} else {
					// Close the element after all files are fetched with fade-out animation
					const modal = document.getElementById("startup");
					modal.classList.add("fade-out");
					setTimeout(() => modal.close(), 500); // Adjust timing to match CSS transition duration
				}
			})
			.catch(error => console.error("Error fetching file:", error));
	}

	// Start fetching the first file
	fetchFileWithInterval(0);
}

async function getFileByPath(filePath) {
	try {
		// Split the filePath into folderName and fileName
		const [folderName, fileName] = filePath.split('/');

		// Fetch data from database
		var memory = await getdb('trojencat', 'rom');
		const matchingFiles = [];

		// Iterate through memory to find the specified folder
		for (const folder of memory) {
			if (folder.folderName === folderName) {
				// Iterate through content of the folder to find files with specified name
				for (const item of folder.content) {
					if (item.fileName === fileName) {
						// If found, add the file object to the array
						matchingFiles.push({ id: item.uid, name: item.fileName });
					}
				}
				// No need to break here, as there might be multiple folders with the same name
			}
		}
		// Return the array of matching files
		return matchingFiles;
	} catch (error) {
		console.error("Error fetching data:", error);
		return null;
	}
}

function checktaskbar(){}

function getfourthdimension() {
	const currentDate = new Date();
	return {
		year: currentDate.getFullYear(),
		month: currentDate.getMonth() + 1,
		day: currentDate.getDate(),
		hour: currentDate.getHours(),
		minute: currentDate.getMinutes(),
		second: currentDate.getSeconds()
	};
}

async function strtappse() {
	document.getElementById("strtappsugs").innerHTML = "";

	// Get the input value
	const searchValue = document.getElementById("strtsear").value.toLowerCase();
	if (searchValue.length < 2) {
		document.getElementById("strtappsugs").style.visibility = "hidden"
		return
	} else {
		document.getElementById("strtappsugs").style.visibility = "visible"
	}

	let arrayToSearch = await getFileNamesByFolder("Apps");

	arrayToSearch.forEach(item => {
		// Calculate similarity between item name and search value
		const similarity = calculateSimilarity(item.name.toLowerCase(), searchValue);

		// Set threshold for similarity (adjust as needed)
		const similarityThreshold = 0.5;

		if (similarity >= similarityThreshold) {
			const newElement = document.createElement("div");
			newElement.innerHTML = item.name + `<span class="material-icons" onclick="openapp('`+item.name+`', '`+item.id+`')">arrow_outward</span>`;
			document.getElementById("strtappsugs").appendChild(newElement);
		}
	});
}

function calculateSimilarity(string1, string2) {
	const m = string1.length;
	const n = string2.length;
	const dp = Array.from(Array(m + 1), () => Array(n + 1).fill(0));

	for (let i = 0; i <= m; i++) {
		for (let j = 0; j <= n; j++) {
			if (i === 0) dp[i][j] = j;
			else if (j === 0) dp[i][j] = i;
			else if (string1[i - 1] === string2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
			else {
				const penalty = (i + j) / (m + n);
				dp[i][j] = 1 + Math.min(dp[i][j - 1], dp[i - 1][j], dp[i - 1][j - 1] + penalty);
			}
		}
	}

	return 1 - dp[m][n] / Math.max(m, n);
}

document.getElementById("strtsear").addEventListener("keydown", async function(event) {
	if (event.key === "Enter") {
		event.preventDefault();
		const searchValue = this.value.toLowerCase();

		let arrayToSearch = await getFileNamesByFolder("Apps");

		let maxSimilarity = -1;
		let appToOpen = null;

		arrayToSearch.forEach(item => {
			// Calculate similarity between item name and search value
			const similarity = calculateSimilarity(item.name.toLowerCase(), searchValue);

			// Update maxSimilarity and appToOpen if similarity is higher
			if (similarity > maxSimilarity) {
				maxSimilarity = similarity;
				appToOpen = item;
			}
		});

		// Open the app with the highest similarity (if found)
		if (appToOpen) {
			openapp(appToOpen.name, appToOpen.id)
		}
	}
});

async function getFolderNames() {
	try {
		var memory = await getdb('trojencat', 'rom');
		const folderNames = [];

		for (const folder of memory) {
			folderNames.push(folder.folderName);
		}

		return folderNames;
	} catch (error) {
		console.error("Error fetching data:", error);
		return null;
	}
}
