var batteryLevel, winds = {}, rp, flwint = true, memory, _nowapp, fulsapp = false, nowappdo, appsHistory = [], nowwindow, appicns = {}, dev = true, appfound = 'files', fileslist = [], qsetscache = {};
var really = false, initmenuload = true, fileTypeAssociations = {}, Gtodo, notifLog = {};
var novaFeaturedImage = `https://images.unsplash.com/photo-1716980197262-ce400709bf0d?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`;

document.getElementById("bgimage").src = novaFeaturedImage;
var defAppsList = [
	"camera",
	"clock",
	"media",
	"gallery",
	"browser",
	"studio",
	"calculator",
	"text",
	"store",
	"files",
	"settings",
];

gid("nowrunninapps").style.display = "none";

const rllog = console.log;

async function qsetsRefresh() {
	await updateMemoryData()
}

gid('seprw-openb').onclick = function () {
	gid('searchside').style.flexGrow = 1;
}

Object.defineProperty(window, 'nowapp', {
	get() {
		return _nowapp;
	},
	set(value) {
		_nowapp = value;
		dewallblur()
	}
});

function loginscreenbackbtn() {
	document.getElementsByClassName("backbtnuserspg")[0].style.display = "none";
	document.getElementsByClassName("userselect")[0].style.flex = "1";
	document.getElementsByClassName("logincard")[0].style.flex = "0";
}

async function showloginmod() {
	closeElementedis();
	document.getElementsByClassName("backbtnuserspg")[0].style.display = "none";

	function createUserDivs(users) {
		const usersChooser = document.getElementById('userschooser');
		usersChooser.innerHTML = '';
		const defaultIcon = 'https://cdn-novaos-server.milosantos.com/user-icon.png'; // Default icon URL
	  
		users.forEach(async (cacusername) => {
		  const userDiv = document.createElement('div');
		  userDiv.className = 'user';
		  userDiv.tabIndex = 0;
		  const selectUser = async function() {
			memory = null;
			CurrentUsername = cacusername;
			let isdefaultpass;
			try {
				isdefaultpass = await checkPassword('nova');
			} catch(err) {}

			if (isdefaultpass) {
				await getdb();
				gid('loginmod').close();
				setTimeout(startup, 500);
			}

			document.getElementsByClassName("backbtnuserspg")[0].style.display = "flex";
				document.getElementsByClassName("userselect")[0].style.flex = "0";
				document.getElementsByClassName("logincard")[0].style.flex = "1";
				gid("loginform1").focus();
		  };
		
		  userDiv.addEventListener("mouseup", selectUser);
		
		  userDiv.addEventListener("keydown", function (event) {
			if (event.key === "Enter") {
			  selectUser();
			}
		  });
	  
		  const img = document.createElement('img');
		  img.className = 'icon';
		  img.src = defaultIcon;
	  
		  const nameDiv = document.createElement('div');
		  nameDiv.className = 'name';
		  nameDiv.textContent = cacusername;
	  
		  userDiv.appendChild(img);
		  userDiv.appendChild(nameDiv);
		  usersChooser.appendChild(userDiv);
		});
	  }

	  let users = await getallusers();
	  createUserDivs(users);

	  if (users.length > 0) {
		document.querySelector('.user').focus();
	  }	  

	gid('loginmod').showModal();
	gid('loginform1').addEventListener("keydown", async function (event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			await checkifpassright();
		}
	});
}

function setsrtpprgbr(val) {
	let progressBar = document.getElementById('progress-bar');
	let width = val;
	progressBar.style.width = width + '%';
}

async function startup() {
	gid("edison").showModal();
	console.log("Startup");
	setsrtpprgbr(0)
	const start = performance.now();
	try { await updateMemoryData() }
	catch (err) { console.error("qsetsRefresh error:", err); }

	try {
		gid('startupterms').innerHTML = "Initialising clock...";
		setsrtpprgbr(10)
		await updateTime();
	} catch (err) { console.error("updateTime error:", err); }

	try {
		gid('startupterms').innerHTML = "Checking themes...";
		setsrtpprgbr(20)
		setInterval(updateTime, 1000);
		await checkdmode();
	} catch (err) { console.error("checkdmode error:", err); }

	try {
		gid('startupterms').innerHTML = "<span id='struploadtasnr'>Loading TaskBar...</span>";
		await genTaskBar();
		setsrtpprgbr(65)
	} catch (err) { console.error("genTaskBar error:", err); }

	try {
		await dod();
		// Initialize the associations from settings
		async function loadFileTypeAssociations() {
			const associations = await getSetting('fileTypeAssociations');
			fileTypeAssociations = associations || {};
			await cleanupInvalidAssociations();
		}

		loadFileTypeAssociations();
		setsrtpprgbr(100)
		gid('startupterms').innerHTML = "Startup completed";
		setTimeout(closeElementedis, 500)
	} catch (err) { console.error("dod error:", err); }

	const end = performance.now();

	console.log(`Startup ended: ${(end - start).toFixed(2)}ms`);
	async function fetchDataAndUpdate() {
		let localupdatedataver = localStorage.getItem("updver");
		let fetchupdatedata = await fetch("versions.json");

		if (fetchupdatedata.ok) {
			let fetchupdatedataver = (await fetchupdatedata.json()).osver;

			if (localupdatedataver !== fetchupdatedataver) {
				if (await justConfirm("Update default apps?", "Your default apps are old. Update them to access new features and fixes.")) {
					await installdefaultapps();
					startup();
				} else {
					say("You can always update app on settings app/Preferances")
				}
			}
		} else {
			console.error("Failed to fetch data from the server.");
		}
	}

	fetchDataAndUpdate();
}

document.addEventListener("DOMContentLoaded", async function () {
	console.log("DOMCL");

	// Check if the database 'trojencat' exists
	await getdb('trojencat', 'rom')
		.then(async (result) => {
			checkAndRunFromURL();
			gid('startupterms').innerHTML += "<span>Checking database...</span>";
			try {
				if (result !== null) {
					await showloginmod();

				} else {
					await say(`<h2>Terms of service and License</h2><p>By using Nova OS, you agree to the <a href="https://github.com/adthoughtsglobal/Nova-OS/blob/main/Adthoughtsglobal%20Nova%20Terms%20of%20use">Adthoughtsglobal Nova Terms of Use</a>. <be><small>We do not collect your personal information. <br>Read the terms clearly before use.</small>`);
					await say(`<h2>Your default password</h2><p>The default password for ${CurrentUsername} is 'nova'. You can change this in settings.</p>`);
					initialiseOS();
				}
			} catch (error) {
				console.error('Error in database operations:', error);
			}


		})
		.catch(async (error) => {
			console.error('Error retrieving data from the database:', error);
			await showloginmod()
		});
	var bgImage = document.getElementById("bgimage");

	bgImage.addEventListener("click", function () {
		nowapp = '';
		dewallblur();
	});
});

let timeFormat;
var condition = true;
try {
	qsetsRefresh()
	condition = getSetting("timefrmt") == '24 Hour' ? false : true;
} catch { }

function updateTime() {
	const now = new Date();
	let hours = now.getHours();


	if (condition) {
		// 12-hour format
		const ampm = hours >= 12 ? 'PM' : 'AM';
		hours = (hours % 12) || 12;
		timeFormat = `${hours}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} ${ampm}`;
	} else {
		// 24-hour format
		timeFormat = `${hours.toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
	}

	const date = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;

	gid('time-display').innerText = timeFormat;
	gid('date-display').innerText = date;
}


const jsonToDataURI = json => `data:application/json,${encodeURIComponent(JSON.stringify(json))}`;

async function openn() {
	gid("appsindeck").innerHTML = `<span class="loader" id="appsloader"></span>`
	gid("strtsear").value = ""
	gid("strtappsugs").style.display = "none";

	let x = await getFileNamesByFolder("Apps");
	x.sort((a, b) => a.name.localeCompare(b.name));
	if (x.length == 0 && initmenuload) {
		initmenuload = false
		gid("appdmod").close()
		let choicetoreinst = await justConfirm(`Re-initialize OS?`, `Did the OS initialization fail? if yes, we can re-initialize your OS and install all the default apps. \n\nNovaOS did not find any apps while initial load of Nova Menu. \n\nre-initializing your OS may delete your data.`)
		if (choicetoreinst) {
			initialiseOS()
		}
		return;
	}

	initmenuload = false
	Promise.all(x.map(async (app) => {
		// Create a div element for the app shortcut
		var appShortcutDiv = document.createElement("div");
		appShortcutDiv.className = "app-shortcut tooltip sizableuielement";
		appShortcutDiv.setAttribute("onclick", "openfile('" + app.id + "')");

		// Create a span element for the app icon
		var iconSpan = document.createElement("span");

		if (!appicns[app.name]) {
			// Fetch the content asynchronously using getFileById
			const content = await getFileById(app.id);

			// Unshrink the content
			const unshrunkContent = unshrinkbsf(content.content);

			// Use the getAppIcon function to fetch the icon
			const icon = getAppIcon(unshrunkContent, app.name);

			if (icon) {
				iconSpan.innerHTML = icon;
			} else {
				iconSpan.innerHTML = defaultAppIcon;
			}
		} else {
			iconSpan.innerHTML = appicns[app.name];
		}

		function getapnme(x) {
			return x.split('.')[0];
		}

		// Create a span element for the app name
		var nameSpan = document.createElement("span");
		nameSpan.className = "appname";
		nameSpan.textContent = getapnme(app.name);

		var tooltisp = document.createElement("span");
		tooltisp.className = "tooltiptext";
		tooltisp.textContent = getapnme(app.name);

		// Append both spans to the app shortcut container
		appShortcutDiv.appendChild(iconSpan);
		appShortcutDiv.appendChild(nameSpan);
		appShortcutDiv.appendChild(tooltisp);

		gid("appsindeck").appendChild(appShortcutDiv);
	})).then(() => {

		// gid('appsloader').remove();
	}).catch((error) => {
		console.error('An error occurred:', error);
	});
	if (gid("closeallwinsbtn").checked) {
		gid("closeallwinsbtn").checked = false;
	}
	if (!Object.keys(winds).length) {

		gid("closeallwinsbtn").checked = true;
		gid("closeallwinsbtn").setAttribute("disabled", true)
	} else {

		gid("closeallwinsbtn").setAttribute("disabled", false)
	}
	gid('appdmod').showModal()

	scaleUIElements(await getSetting("UISizing"))
}

async function loadrecentapps() {
	gid("serrecentapps").innerHTML = ``
	if (appsHistory.length < 1) {
		gid("partrecentapps").style.display = "none";
		gid("serrecentapps").innerHTML = `No recent apps`
		return;
	} else {
		gid("partrecentapps").style.display = "block";
	}
	let x = await getFileNamesByFolder("Apps");
	x.reverse();
	Promise.all(x.map(async (app) => {
		if (!appsHistory.includes(app.name)) {
			return
		}
		// Create a div element for the app shortcut
		var appShortcutDiv = document.createElement("div");
		appShortcutDiv.className = "app-shortcut tooltip sizableuielement";
		appShortcutDiv.setAttribute("onclick", "openapp('" + app.name + "', '" + app.id + "')");
		// Create a span element for the app icon
		var iconSpan = document.createElement("span");
		if (!appicns[app.name]) {

			// Fetch the content asynchronously using getFileById
			const content = await getFileById(app.id);

			// Unshrink the content
			const unshrunkContent = unshrinkbsf(content.content);

			// Create a temporary div to parse the content
			const tempElement = document.createElement('div');
			tempElement.innerHTML = unshrunkContent;

			// Get all meta tags
			const metaTags = tempElement.getElementsByTagName('meta');

			// Create an object to store meta tag data
			let metaTagData = null;

			// Iterate through meta tags and extract data
			Array.from(metaTags).forEach(tag => {
				const tagName = tag.getAttribute('name');
				const tagContent = tag.getAttribute('content');
				if (tagName === 'nova-icon' && tagContent) {
					metaTagData = tagContent;
				}
			});

			if (typeof metaTagData === "string") {
				if (containsSmallSVGElement(metaTagData)) {
					iconSpan.innerHTML = metaTagData;
				} else {

					iconSpan.innerHTML = defaultAppIcon;
				}
			} else {
				iconSpan.innerHTML = defaultAppIcon;
			}
			appicns[app.name] = iconSpan.innerHTML

		} else {
			iconSpan.innerHTML = appicns[app.name]
		}

		// Create a span element for the app name
		var nameSpan = document.createElement("span");
		nameSpan.className = "appname";
		nameSpan.textContent = app.name;

		var tooltisp = document.createElement("span");
		tooltisp.className = "tooltiptext";
		tooltisp.textContent = app.name;

		// Append both spans to the app shortcut container
		appShortcutDiv.appendChild(iconSpan);
		appShortcutDiv.appendChild(nameSpan);
		appShortcutDiv.appendChild(tooltisp);

		gid("serrecentapps").appendChild(appShortcutDiv);
	})).then(async () => {
		scaleUIElements(await getSetting("UISizing"))
	}).catch((error) => {
		console.error('An error occurred:', error);
	});
}

function focusFirstElement() {
	var firstElement = document.querySelector('#appsindeck :first-child');
	if (firstElement) {
		firstElement.focus();
	}
}

function makedefic(str) {
	const vowelPattern = /[aeiouAEIOU\s]+/g;
	const consonantPattern = /[^aeiouAEIOU\s]+/g;

	const vowelMatches = str.match(vowelPattern);
	const consonantMatches = str.match(consonantPattern);

	if (consonantMatches && consonantMatches.length >= 2) {
		const firstTwoConsonants = consonantMatches.slice(0, 2);
		const capitalized = firstTwoConsonants.map((letter, index) => index === 0 ? letter.toUpperCase() : letter.toLowerCase());
		const result = capitalized.join('');
		return result.length > 2 ? result.slice(0, 2) : result;
	} else {
		const firstLetter = str.charAt(0).toUpperCase();
		const firstConsonantIndex = str.search(consonantPattern);
		if (firstConsonantIndex !== -1) {
			const firstConsonant = str.charAt(firstConsonantIndex).toLowerCase();
			const result = firstLetter + firstConsonant;
			return result.length > 2 ? result.slice(0, 2) : result;
		} else {
			return firstLetter;
		}
	}
}


function updateBattery() {
	var batteryPromise;

	// Check if the battery API is supported
	if ('getBattery' in navigator) {
		batteryPromise = navigator.getBattery();
	} else if ('battery' in navigator) {
		batteryPromise = Promise.resolve(navigator.battery);
	} else {
		console.log('No Battery API');
		gid("batterydisdiv").style.display = "none";
		return;
	}

	batteryPromise.then(function (battery) {
		// Get the battery level
		var batteryLevel = Math.floor(battery.level * 100);
		var isCharging = battery.charging;

		// Display or hide the battery info based on conditions
		if ((batteryLevel === 100 && isCharging) || (batteryLevel === 0 && isCharging)) {
			document.getElementById("batterydisdiv").style.display = "none";
		} else {
			document.getElementById("batterydisdiv").style.display = "block";
		}

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
		var batteryDisplayElement = document.getElementById('battery-display');
		var batteryPDisplayElement = document.getElementById('battery-p-display');
		if (batteryDisplayElement && batteryPDisplayElement) {
			if (iconClass !== batteryDisplayElement.innerText) {
				// Update the display only if the value changes
				batteryDisplayElement.innerHTML = iconClass;
				batteryPDisplayElement.innerHTML = batteryLevel + "%";
			}
		}
	}).catch(function (error) {
		console.log("Battery Error: " + error);

	});
}
updateBattery();

navigator.getBattery().then(function (battery) {
	battery.addEventListener('levelchange', updateBattery);
});

function dragElement(elmnt) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	if (gid(elmnt.id + "header")) {
		// if present, the header is where you move the DIV from:
		gid(elmnt.id + "header").onmousedown = dragMouseDown;
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
		e = e || window.event;
		e.preventDefault();
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;

		// calculate the new position
		let newTop = elmnt.offsetTop - pos2;
		let newLeft = elmnt.offsetLeft - pos1;

		// get the boundaries of the viewport
		let boundaryTop = 0;
		let boundaryLeft = 0;
		let boundaryBottom = window.innerHeight - elmnt.offsetHeight;
		let boundaryRight = window.innerWidth - elmnt.offsetWidth;

		// set the element's new position, ensuring it stays within the boundaries
		if (newTop < boundaryTop) {
			newTop = boundaryTop;
		}
		if (newTop > boundaryBottom) {
			newTop = boundaryBottom;
		}
		if (newLeft < boundaryLeft) {
			newLeft = boundaryLeft;
		}
		if (newLeft > boundaryRight) {
			newLeft = boundaryRight;
		}

		elmnt.style.top = newTop + "px";
		elmnt.style.left = newLeft + "px";
	}

	function closeDragElement() {
		// stop moving when mouse button is released:
		document.onmouseup = null;
		document.onmousemove = null;
	}
}

async function dod() {
	let x;
	try {
		gid("desktop").innerHTML = ``;
		let y = await getFileNamesByFolder("Desktop")
		y.forEach(async function (app) {
			// Create a div element for the app shortcut
			var appShortcutDiv = document.createElement("div");
			appShortcutDiv.className = "app-shortcut sizableuielement";
			appShortcutDiv.setAttribute("onclick", "openfile('"+app.id+"')");
			appShortcutDiv.setAttribute("unid", app.id);


			// Create a span element for the app icon
			var iconSpan = document.createElement("span");

			// Fetch the content asynchronously using getFileById
			const content = await getFileById(app.id);

			// Unshrink the content
			const unshrunkContent = unshrinkbsf(content.content);

			// Create a temporary div to parse the content
			const tempElement = document.createElement('div');
			tempElement.innerHTML = unshrunkContent;

			// Get all meta tags
			const metaTags = tempElement.getElementsByTagName('meta');

			// Create an object to store meta tag data
			let metaTagData = null;

			// Iterate through meta tags and extract data
			Array.from(metaTags).forEach(tag => {
				const tagName = tag.getAttribute('name');
				const tagContent = tag.getAttribute('content');
				if (tagName === 'nova-icon' && tagContent) {
					metaTagData = tagContent;
				}
			});


			if (typeof metaTagData === "string") {
				if (containsSmallSVGElement(metaTagData)) {
					iconSpan.innerHTML = metaTagData;
				} else {

					iconSpan.innerHTML = `<span class="app-icon">` + makedefic(app.name) + `</span>`;
				}
			} else {
				iconSpan.innerHTML = `<span class="app-icon">` + makedefic(app.name) + `</span>`;
			}



			// Create a span element for the app name
			var nameSpan = document.createElement("span");
			nameSpan.className = "appname";
			nameSpan.textContent = app.name;

			// Append both spans to the app shortcut container
			appShortcutDiv.appendChild(iconSpan);
			appShortcutDiv.appendChild(nameSpan);

			gid("desktop").appendChild(appShortcutDiv);
		});
		x = await getFileById(await getSetting("wall"));
	} catch (error) {
		console.error(error)
		remSetting("wall");
	}

	if (x != undefined) {
		console.log("wallpaper defined", x)
		let unshrinkbsfX = unshrinkbsf(x.content);
		document.getElementById('bgimage').src = unshrinkbsfX;
	}
	document.getElementById("bgimage").onerror = async function () {
		console.log("wallpaper error")
		document.getElementById("bgimage").src = novaFeaturedImage;
		if (await getSetting("wall")) {
			remSetting("wall");
		}
	};

	scaleUIElements(await getSetting("UISizing"))
}

function closeElementedis() {
	var element = document.getElementById("edison");
	element.classList.add("closeEffect");

	setTimeout(function () {
		element.close()
		element.classList.remove("closeEffect");
	}, 1000);
}

function isElement(element) {
	return element instanceof Element || element instanceof HTMLDocument;
}

function clwin(x) {

	if (isElement(x)) {
		delete winds[x.getAttribute("data-winds")];
		x.remove();
		return;
	}
	document.getElementById(x).classList.add("transp3")

	setTimeout(() => {
		document.getElementById(x).classList.remove("transp3")
		document.getElementById(x).remove();
		nowapp = '';
	}, 700);
}

function flwin(x) {
	x.parentElement.parentElement.parentElement.classList.add("transp2")
	if (x.innerHTML == "open_in_full") {
		let oke = x.parentElement.parentElement.parentElement;

		oke.style.width = "calc(100% - 0px)";
		oke.style.height = "calc(100% - 57px)";
		oke.style.left = "0";
		oke.style.top = "0";

		x.innerHTML = "close_fullscreen";
		fulsapp = true;
	} else {
		// minimise window
		let oke = x.parentElement.parentElement.parentElement;

		oke.style.left = "calc(50vw - 33.5vw)";
		oke.style.top = "calc(50vh - 35vh)";
		oke.style.width = "65vw";
		oke.style.height = "70vh";

		nowapp = ""
		dewallblur();
		x.innerHTML = "open_in_full"
		fulsapp = false;
	}
	setTimeout(() => {
		x.parentElement.parentElement.parentElement.classList.remove("transp2")

	}, 1000);
}

function getAppIcon(unshrunkContent, appname) {
	if (appicns[appname]) return appicns[appname];

	const decodedContent = decodeBase64Content(unshrunkContent);

	const tempElement = document.createElement('div');
	tempElement.innerHTML = decodedContent;

	const metaTag = Array.from(tempElement.getElementsByTagName('meta')).find(tag =>
		tag.getAttribute('name') === 'nova-icon' && tag.getAttribute('content')
	);

	if (!metaTag) return null;

	const metaTagContent = metaTag.getAttribute('content');
	if (typeof metaTagContent === "string" && containsSmallSVGElement(metaTagContent)) {
		appicns[appname] = metaTagContent;
		return metaTagContent;
	}

	return null;
}

function decodeBase64Content(str) {
    // Check if the string starts with a data URL prefix
    const base64Prefix = ';base64,';
    const prefixIndex = str.indexOf(base64Prefix);

    if (prefixIndex !== -1) {
        // Strip the prefix
        str = str.substring(prefixIndex + base64Prefix.length);
    }

    // Decode only if the string is a valid Base64
    return isBase64(str) ? atob(str) : str;
}

function getAppTheme(unshrunkContent) {
	const tempElement = document.createElement('div');
	tempElement.innerHTML = unshrunkContent;
	const metaTags = tempElement.getElementsByTagName('meta');
	let metaTagData = null;
	Array.from(metaTags).forEach(tag => {
		const tagName = tag.getAttribute('name');
		const tagContent = tag.getAttribute('content');
		if (tagName === 'theme-color' && tagContent) {
			metaTagData = tagContent;
		}
	});

	return metaTagData;
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
var content;

function putwinontop(x) {
	if (Object.keys(winds).length > 1) {
		// Convert the values of winds into an array of numbers
		const windValues = Object.values(winds).map(Number);

		// Calculate the maximum value from the array
		const maxWindValue = Math.max(...windValues);

		// Set the zIndex
		document.getElementById(x).style.zIndex = maxWindValue + 1;
	} else {
		document.getElementById(x).style.zIndex = 0;
	}
}

function toTitleCase(str) {
	rp = str
	return str.toLowerCase().replace(/(?:^|\s)\w/g, function (match) {
		return match.toUpperCase();
	});
}

function requestLocalFile() {
	var requestID = genUID()
	x = {
		"appname": "files",
		"type": "open",
		"identifier": requestID
	}
	localStorage.setItem("todo", JSON.stringify(x))
	openapp("files", 1)
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

		await updateMemoryData()
		folderName = folderName.replace(/\/$/, ''); // Remove the trailing slash
		let parts = folderName.split('/');
		let current = memory;

		for (let part of parts) {
			part += '/';
			if (!current[part]) {
				current[part] = {};
			}
			current = current[part];
		}

		await setdb(memory);
		console.log(`Created: "${folderName}"`);
	} catch (error) {
		console.error("Error creating folder:", error);
	}
}

function folderExists(folderName) {
	let parts = folderName.replace(/\/$/, '').split('/');
	let current = memory;

	for (let part of parts) {
		part += '/';
		if (!current[part]) {
			return false;
		}
		current = current[part];
	}

	return true;
}

function isBase64(str) {
    try {
        // Function to validate Base64 string
        function validateBase64(data) {
            // Ensure the string has the correct Base64 character set
            const base64Pattern = /^[A-Za-z0-9+/=]+$/;
            if (!base64Pattern.test(data)) {
                return false;
            }

            // Add padding if necessary
            const padding = data.length % 4;
            if (padding > 0) {
                data += '='.repeat(4 - padding);
            }

            // Attempt to decode the Base64 string
            atob(data);
            return true;
        }

        // Check without MIME type prefix
        if (validateBase64(str)) {
            return true;
        }

        // Check if the string starts with a MIME type prefix
        const base64Prefix = 'data:';
        const base64Delimiter = ';base64,';
        if (str.startsWith(base64Prefix)) {
            const delimiterIndex = str.indexOf(base64Delimiter);
            if (delimiterIndex !== -1) {
                const base64Data = str.substring(delimiterIndex + base64Delimiter.length);
                return validateBase64(base64Data);
            }
        }

        return false;
    } catch (err) {
        return false;
    }
}

async function createFile(folderName2, fileName, type, content, metadata = {}) {
    const folderName = folderName2.replace(/\/$/, '');
    const fileName2 = type ? `${fileName}.${type}` : fileName;

    if (!fileName2) {
        console.log("Cannot find file name. Can't create file.");
        return null;
    }

    await updateMemoryData();

    if (!folderExists(folderName)) {
        await createFolder(folderName);
    }

    const folder = createFolderStructure(folderName);

    try {
        let base64data = isBase64(content) ? content : '';

        if (!base64data) {
            // Create a Blob from the content
            const mimeType = type ? `application/${type}` : 'application/octet-stream';
            const blob = new Blob([content], { type: mimeType });

            // Create a URL for the Blob and convert to Base64
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async function () {
                base64data = reader.result; // Use the full Data URL with prefix

                await handleFile(folder, folderName, fileName2, base64data, type, metadata);
            };
        } else {
            await handleFile(folder, folderName, fileName2, base64data, type, metadata);
        }
    } catch (error) {
        console.error("Error creating file:", error);
        return null;
    }

    // Helper function to handle file creation or update
    async function handleFile(folder, folderName, fileName2, base64data, type, metadata) {
        if (type === "app" && fileName2.endsWith(".app")) {
            console.log("App file to be created!");
            const appData = await getFileByPath(`Apps/${fileName2}`);
            if (appData) {
                await updateFile("Apps", appData.id, { metadata, content: base64data, fileName: fileName2, type });
                extractAndRegisterCapabilities(appData.id, base64data);
                return appData.id || null;
            }
        }

        const existingFile = Object.values(folder).find(file => file.fileName === fileName2);
        if (existingFile) {
            console.log(`Updating "${folderName}/${fileName2}"`);
            await updateFile(folderName, existingFile.id, { metadata, content: base64data, fileName: fileName2, type });
            return existingFile.id;
        } else {
            const uid = genUID();
            metadata.datetime = getfourthdimension();
            folder[fileName2] = { id: uid, type, content: base64data, metadata: JSON.stringify(metadata) };
            console.log(`Created "${folderName}/${fileName2}"`);
            if (type === "app" && fileName2.endsWith(".app")) {
                extractAndRegisterCapabilities(uid, base64data);
            }
            await setdb(memory);
            return uid;
        }
    }
}

async function extractAndRegisterCapabilities(appId, content) {
	console.log("EX CAPABLE:" + appId)
    try {
        if (isBase64(content)) {
            content = decodeBase64Content(content);
        }

		console.log(content.substring(0, 100));

        let parser = new DOMParser();
        let doc = parser.parseFromString(content, "text/html");
        let metaTag = doc.querySelector('meta[name="capabilities"]');

        if (metaTag) {
            let capabilities = metaTag.getAttribute("content").split(',');
            await registerApp(appId, capabilities);
            console.log(`Registered capabilities for app ID: ${appId}`);
        } else {
            console.log(`No capabilities meta tag found for app ID: ${appId}`);
        }
    } catch (error) {
        console.error("Error extracting and registering capabilities:", error);
    }
}

async function registerApp(appId, capabilities) {
    for (let fileType of capabilities) {
        if (fileType === "all") {
            fileTypeAssociations["all"] = appId;
        } else {
            fileTypeAssociations[fileType] = appId;
        }
    }
    await setSetting('fileTypeAssociations', fileTypeAssociations);
}


async function cleanupInvalidAssociations() {
    const validAppIds = await getAllValidAppIds();

    for (let fileType in fileTypeAssociations) {
        let appId = fileTypeAssociations[fileType];
        if (!validAppIds.includes(appId)) {
            delete fileTypeAssociations[fileType];
        }
    }

    await setSetting('fileTypeAssociations', fileTypeAssociations);
    console.log('Cleanup completed: Invalid app associations removed.');
}

async function getAllValidAppIds() {
    const appsFolder = await getFileNamesByFolder('Apps/');
    return Object.keys(appsFolder || {}).map(appFileName => appsFolder[appFileName].id);
}


// Simulate creating a folder
function createFolderStructure(folderName) {
	let parts = folderName.split('/');
	let current = memory;
	for (let part of parts) {
		part += '/';
		if (!current[part]) {
			current[part] = {};
		}
		current = current[part];
	}
	return current;
}

async function updateFile(folderName, fileId, newData) {
	function findFile(folder, fileId) {
		for (let key in folder) {
			if (typeof folder[key] === 'object' && folder[key] !== null) {
				if (folder[key].id === fileId) {
					return { parent: folder, key: key };
				} else if (key.endsWith('/') && typeof folder[key] === 'object') {
					let result = findFile(folder[key], fileId);
					if (result) {
						return result;
					}
				}
			}
		}
		return null;
	}

	try {
		// Locate the target folder
		let targetFolder = memory;
		let folderNames = folderName.split('/');
		for (let name of folderNames) {
			if (name) {
				targetFolder = targetFolder[name + '/'];
				if (!targetFolder) {
					throw new Error(`Folder "${name}" not found.`);
				}
			}
		}

		// Find the file within the folder structure
		let fileLocation = findFile(targetFolder, fileId);

		if (fileLocation) {
			let fileToUpdate = fileLocation.parent[fileLocation.key];
			fileToUpdate.metadata = newData.metadata !== undefined ? JSON.stringify(newData.metadata) : fileToUpdate.metadata;
			fileToUpdate.content = newData.content !== undefined ? newData.content : fileToUpdate.content;
			fileToUpdate.fileName = newData.fileName !== undefined ? newData.fileName : fileLocation.key;
			fileToUpdate.type = newData.type !== undefined ? newData.type : fileToUpdate.type;

			// If the file name has changed, update the key in the folder
			if (newData.fileName !== undefined && newData.fileName !== fileLocation.key) {
				fileLocation.parent[newData.fileName] = fileToUpdate;
				delete fileLocation.parent[fileLocation.key];
			}

			await setdb(memory);
			console.log(`Modified: "${fileToUpdate.fileName}"`);
		} else {
			console.log(`Creating New: "${fileId}"`);
			targetFolder[newData.fileName || `NewFile_${fileId}`] = {
				id: fileId,
				metadata: newData.metadata ? JSON.stringify(newData.metadata) : '',
				content: newData.content || '',
				type: newData.type || ''
			};
			await setdb(memory);
		}
	} catch (error) {
		console.error("Error updating file:", error);
	}
}

async function getFileById(id) {
	if (!id) return undefined;
	await updateMemoryData();
	
	function searchFolder(folder, currentPath = '') {
		for (let key in folder) {
			if (typeof folder[key] === 'object' && folder[key] !== null) {
				const newPath = currentPath + key;
				if (folder[key].id === id) {
					return {
						fileName: key,
						id: folder[key].id,
						content: folder[key].content,
						metadata: folder[key].metadata,
						path: currentPath
					};
				} else if (key.endsWith('/')) {
					const result = searchFolder(folder[key], newPath);
					if (result) return result;
				}
			}
		}
		return null;
	}

	return searchFolder(memory);
}


function makedialogclosable(ok) {
	const myDialog = gid(ok);

	document.addEventListener('click', (event) => {
		if (event.target === myDialog) {
			myDialog.close();
		}
	});
}
makedialogclosable('appdmod')

async function getFileNamesByFolder(folderName) {
	await updateMemoryData();
	try {
		await updateMemoryData()
		const filesInFolder = [];

		for (const key in memory) {
			if (key === folderName || key.startsWith(folderName)) {
				const isFolder = key.endsWith('/');
				if (isFolder) {
					const folder = memory[key];
					for (const fileName in folder) {
						if (!fileName.endsWith('/')) {
							const file = folder[fileName];
							filesInFolder.push({ id: file.id, name: fileName });
						}
					}
				}
			}
		}

		return filesInFolder;
	} catch (error) {
		console.error("Error fetching data:", error);
		return null;
	}
}

function justConfirm(title, message) {
	return new Promise((resolve) => {
		const modal = document.querySelector("#NaviconfDia");
		modal.querySelector('h1').textContent = title;
		modal.querySelector('p').innerHTML = message;

		const yesButton = modal.querySelector('.yes-button');
		yesButton.onclick = () => {
			modal.close();
			resolve(true);
		};

		const noButton = modal.querySelector('.notbn');
		noButton.onclick = () => {
			modal.close();
			resolve(false);
		};

		modal.showModal();
	});
}

function say(message, status) {
	return new Promise((resolve) => {
		const modal = document.createElement('dialog');
		modal.classList.add('modal');

		const modalContent = document.createElement('div');
		modalContent.classList.add('modal-content');

		const promptMessage = document.createElement('p');
		let ic = "warning"
		if (status == "success") {
			ic = "check_circle"
		} else if (status == "warning") {
			ic = "warning"
		} else if (status == "failed") {
			ic = "dangerous"
		}

		ic = `<span class="material-symbols-rounded">` + ic + `</span>`

		promptMessage.innerHTML = ic + message;
		modalContent.appendChild(promptMessage);

		const okButton = document.createElement('button');
		okButton.textContent = 'OK';
		okButton.addEventListener('click', () => {
			modal.close();
			modal.remove()
			resolve(true);
		});
		modalContent.appendChild(okButton);

		modal.appendChild(modalContent);
		document.body.appendChild(modal);

		modal.showModal();
	});
}

async function loadtaskspanel() {
	let appbarelement = gid("nowrunninapps")

	appbarelement.innerHTML = ""
	let x = Object.keys(winds).map(key => key.slice(0, -6));
	let wid = Object.keys(winds).map(key => key.slice(-6));

	if (x.length == 0) {
		appbarelement.style.display = "none"
	} else {
		appbarelement.style.display = "flex"
	}
	x.forEach(async function (app, index) {
		// Create a div element for the app shortcut
		var appShortcutDiv = document.createElement("biv");
		appShortcutDiv.className = "app-shortcut tooltip adock sizableuielement";

		appShortcutDiv.addEventListener("click", function () {
			putwinontop('window' + wid[index]);
			winds[app + wid[index]] = Number(gid("window" + wid[index]).style.zIndex);
		})

		// Create a span element for the app icon
		var iconSpan = document.createElement("span");
		iconSpan.innerHTML = (appicns[app]) ? appicns[app] : defaultAppIcon;

		var tooltisp = document.createElement("span");
		tooltisp.className = "tooltiptext";
		tooltisp.innerHTML = app;

		// Append both spans to the app shortcut container
		appShortcutDiv.appendChild(iconSpan);
		appShortcutDiv.appendChild(tooltisp);

		appbarelement.appendChild(appShortcutDiv);
	})

	scaleUIElements(await getSetting("UISizing"))
}

function ask(question, preset) {
	return new Promise((resolve) => {
		const modal = document.createElement('dialog');
		modal.classList.add('modal');

		const modalContent = document.createElement('div');
		modalContent.classList.add('modal-content');

		const promptMessage = document.createElement('p');
		promptMessage.innerHTML = question;
		modalContent.appendChild(promptMessage);

		const inputField = document.createElement('input');
		inputField.setAttribute('type', 'text');
		inputField.value = preset;
		modalContent.appendChild(inputField);

		const okButton = document.createElement('button');
		okButton.textContent = 'OK';
		okButton.addEventListener('click', () => {
			modal.close();
			resolve(inputField.value);
		});
		modalContent.appendChild(okButton);

		modal.appendChild(modalContent);
		document.body.appendChild(modal);

		modal.showModal();
	});
}

var dev;

function shrinkbsf(str) {
	return str;
}

function unshrinkbsf(compressedStr) {
		return compressedStr;
}

async function makewall(deid) {
	console.log("Wallpaper: " + deid)
	let x = await getFileById(deid);
	x = x.content
	x = unshrinkbsf(x)
	setSetting("wall", deid);
	document.getElementById('bgimage').style.backgroundImage = `url("` + x + `")`;
}

async function remfile(ID) {
	try {
		await updateMemoryData();

		function removeFileFromFolder(folder) {
			for (const [name, content] of Object.entries(folder)) {
				if (name.endsWith('/')) {
					if (removeFileFromFolder(content)) return true;
				} else if (content.id === ID) {
					delete folder[name];
					console.log("File eliminated.");
					return true;
				}
			}
			return false;
		}

		let fileRemoved = removeFileFromFolder(memory);

		if (!fileRemoved) {
			console.error(`File with ID "${ID}" not found.`);
		} else {
			await setdb(memory);
		}
	} catch (error) {
		console.error("Error fetching or updating data:", error);
	}
}

async function remfolder(folderPath) {
	try {
		await updateMemoryData()

		// Split the folderPath into parts
		let parts = folderPath.split('/').filter(part => part);
		let current = memory;
		let parent = null;
		let key = null;

		// Traverse the path to find the folder
		for (let i = 0; i < parts.length; i++) {
			let part = parts[i] + '/';
			if (current.hasOwnProperty(part)) {
				parent = current;
				key = part;
				current = current[part];
			} else {
				console.error(`Folder "${folderPath}" not found.`);
				return;
			}
		}

		// Remove only the specified subfolder and its contents
		if (parent && key) {
			delete parent[key];
			console.log(`Folder Eliminated: "${folderPath}"`);
		} else {
			console.error(`Unable to delete folder "${folderPath}".`);
			return;
		}

		// Update the memory database
		await setdb(memory);
	} catch (error) {
		console.error("Error removing folder:", error);
	}
}

async function initialiseOS() {
	const memory = {
		"Downloads/": {
			"Welcome.txt": {
				"id": "sibq81",
				"content": "Welcome to Nova OS! kindly reach us https://adthoughtsglobal.github.io and connect via the available options, we will respond you back! Enjoy!"
			},
			"Subfolder/": {
				"Subfile.txt": {
					"id": "1283jh",
					"content": "This is a file inside a subfolder."
				}
			}
		},
		"Apps/": {}
	};

	console.log("Init from preset")

	setdb(memory).then(async function () {
		await saveMagicStringInLocalStorage(password);
		await ensurePreferencesFileExists()
			.then(async () => await installdefaultapps())
			.then(async () => getFileNamesByFolder("Apps"))
			.then(async (fileNames) => {
				if (defAppsList.length !== fileNames.length) {
					return installdefaultapps();
				}
			})
			.catch(error => {
				console.error("Error during initialization:", error);
			})
			.then(() => startup())
	})

}

async function installdefaultapps() {
	gid("edison").showModal()

	const maxRetries = 2;

	async function updateApp(appName, attempt = 1) {
		try {

			const filePath = "appdata/" + appName + ".html";
			const response = await fetch(filePath);
			if (!response.ok) {
				throw new Error("Failed to fetch file for " + appName);
			}
			const fileContent = await response.text();

			createFile("Apps", appName, "app", fileContent);
			console.log(appName + " modified");
		} catch (error) {
			console.error("Error updating " + appName + ":", error.message);
			if (attempt < maxRetries) {
				console.log("Retrying update: " + appName + " (attempt " + (attempt + 1) + ")");
				await updateApp(appName, attempt + 1);
			} else {
				console.error("Max retries reached for " + appName + ". Skipping update.");
			}
		}

	}

	// Update each app sequentially
	for (let i = 0; i < defAppsList.length; i++) {
		await updateApp(defAppsList[i]);
		if (gid('startupterms')) {
			gid('startupterms').innerText = "Installing Apps"
		}
		setsrtpprgbr(Math.round((i + 1) / defAppsList.length * 100));
	}
	let fetchupdatedata = await fetch("versions.json");

	if (fetchupdatedata.ok) {
		let fetchupdatedataver = (await fetchupdatedata.json()).osver;
		localStorage.setItem("updver", fetchupdatedataver);
	} else {
		console.error("Failed to fetch data from the server.");
	}
	closeElementedis()
}

async function getFileByPath(filePath) {
    await updateMemoryData();
    let parts = filePath.split('/');
    let current = memory;

    for (let i = 0; i < parts.length; i++) {
        let part = parts[i];
        
        // If it's a folder and not the last part, descend into it
        if (part.endsWith('/') && part in current && i !== parts.length - 1) {
            current = current[part];
        } else if (part in current) {
            current = current[part];
        } else {
            return null;
        }
    }
    
    // If current is an object and contains nested files, return their names and IDs
    if (typeof current === 'object' && current !== null && !Array.isArray(current)) {
        let result = [];
        for (let key in current) {
            if (current[key].id) {
                result.push({ name: key, id: current[key].id });
            }
        }
        return result.length > 0 ? result : current;
    }
    
    return current;
}

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

async function prepareArrayToSearch() {
	let arrayToSearch = [];

	function scanFolder(folderPath, folderContents) {
		for (const name in folderContents) {
			const fullPath = `${folderPath}${name}`;
			const item = folderContents[name];

			if (item.id) {
				arrayToSearch.push({ name, id: item.id, type: "file", path: folderPath });
			} else {
				arrayToSearch.push({ name: name, type: "folder", path: folderPath });
				scanFolder(fullPath, item);
			}
		}
	}

	for (const folder in memory) {
		scanFolder(folder, memory[folder]);
	}

	fileslist = arrayToSearch;
}

async function strtappse(event) {
	if (fileslist.length === 0) {
		await prepareArrayToSearch();
	}

	const searchValue = gid("strtsear").value.toLowerCase();
	if (searchValue.length === 0) return;

	const abracadra = await getSetting("smartsearch");

	if (event.key === "Enter") {
		event.preventDefault();

		if (searchValue === "i love nova") {
			gid("searchwindow").close();
			notify("hmm", "you're really goofy...", "Nova just replied you:");
			really = true;
		}

		let maxSimilarity = 0.5;
		let appToOpen = null;

		fileslist.forEach(item => {
			const itemName = item.name.toLowerCase();
			if (item.type === "folder" || (!abracadra && itemName.startsWith(searchValue))) {
				appToOpen = item;
				return false;
			} else if (abracadra) {
				const similarity = calculateSimilarity(itemName, searchValue);
				if (similarity > maxSimilarity) {
					maxSimilarity = similarity;
					appToOpen = item;
				}
			}
		});

		if (appToOpen) {
			openfile(appToOpen.id);
		}
		return;
	}
	let elements = 0;
const itemsWithSimilarity = [];

// Filter and sort items based on similarity
fileslist.forEach(item => {
	const itemName = item.name.toLowerCase();
	let similarity = 1;

	// Check if item is not a folder (folders end with '/')
	if (!itemName.endsWith('/')) {
		if (!abracadra) {
			if (itemName.startsWith(searchValue)) {
				itemsWithSimilarity.push({ item, similarity });
			}
		} else {
			similarity = calculateSimilarity(itemName, searchValue);
			if (similarity >= 0.2) {
				itemsWithSimilarity.push({ item, similarity });
			}
		}
	}
});

itemsWithSimilarity.sort((a, b) => b.similarity - a.similarity);

// Group results by path
const groupedResults = itemsWithSimilarity.reduce((acc, { item }) => {
	const path = item.path || '';
	if (!acc[path]) acc[path] = [];
	acc[path].push(item);
	return acc;
}, {});

// Clear previous search suggestions
gid("strtappsugs").innerHTML = "";

// Display grouped results
let mostRelevantItem = null;
Object.keys(groupedResults).forEach(path => {
	const items = groupedResults[path];
	const pathElement = document.createElement("div");
	pathElement.innerHTML = `<strong>${path}</strong>`;
	gid("strtappsugs").appendChild(pathElement);

	items.forEach(item => {
		if (!mostRelevantItem) mostRelevantItem = item; // Set mostRelevantItem if not set

		const newElement = document.createElement("div");
		newElement.innerHTML = "<div>" + ((appicns[item.name] != undefined) ? appicns[item.name] : defaultAppIcon) + " " + item.name + "</div>" + `<span class="material-icons" onclick="openfile('${item.id}')">arrow_outward</span>`;
		gid("strtappsugs").appendChild(newElement);
		elements++;
	});
});

// Handle the most relevant item
if (mostRelevantItem) {
	gid("partrecentapps").style.display = "none";
	document.getElementsByClassName("previewsside")[0].style.display = "flex";
	gid("seapppreview").style.display = "block";

	gid('seprw-icon').innerHTML = (appicns[mostRelevantItem.name] != undefined) ? appicns[mostRelevantItem.name] : defaultAppIcon;
	gid('seprw-appname').innerText = mostRelevantItem.name;
	gid('seprw-openb').onclick = function () {
		openfile(mostRelevantItem.id);
	};
} else {
	gid("partrecentapps").style.display = "block";
	gid("seapppreview").style.display = "none";
}

gid("strtappsugs").style.display = elements > 0 ? "block" : "none";
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

async function getFolderNames() {
	try {
		await updateMemoryData()
		const folderNames = [];

		for (const key in memory) {
			if (key.endsWith('/')) {
				folderNames.push(key);
			}
		}

		return folderNames;
	} catch (error) {
		console.error("Error fetching data:", error);
		return null;
	}
}

function containsSmallSVGElement(str) {
	var svgRegex = /^<svg\s*[^>]*>[\s\S]*<\/svg>$/i;
	return svgRegex.test(str) && str.length <= 5000;
}

document.onclick = hideMenu;
document.oncontextmenu = rightClick;

function hideMenu() {
	gid("contextMenu").style.display = "none"
}

async function moveFileToFolder(flid, dest) {
	console.log("Moving file: " + flid + " to: " + dest);

	let fileToMove = await getFileById(flid);

	await createFile(dest, fileToMove.fileName, fileToMove.type, fileToMove.content, fileToMove.metadata);

	await remfile(flid);
}


function rightClick(e) {
	e.preventDefault();

	let menu = document.getElementById("contextMenu");

	if (menu.style.display === "block") {
		hideMenu();
	} else {
		menu.style.display = 'block';

		// Get the computed width and height of the context menu
		let menuWidth = menu.offsetWidth;
		let menuHeight = menu.offsetHeight;

		// Calculate the positions considering the viewport boundaries
		let posX = e.pageX;
		let posY = e.pageY;

		if ((posX + menuWidth) > window.innerWidth) {
			posX = window.innerWidth - menuWidth;
		}

		if ((posY + menuHeight) > window.innerHeight) {
			posY = window.innerHeight - menuHeight;
		}

		menu.style.left = posX + "px";
		menu.style.top = posY + "px";
	}
}

var dash = gid("dashboard");

function dashtoggle() {

	if (dash.open) {
		dash.close();
	} else {
		dash.showModal();
	}
}

document.addEventListener('click', (event) => {
	if (event.target === dash) {
		dash.close();
	}
});

async function dewallblur() {
	if (!await getSetting("focusMode")) {
		gid("bgimage").style.filter = "blur(0px)";
		return;
	}
	if (nowapp != "" && nowapp != undefined) {
		gid("bgimage").style.filter = "blur(5px)";
	} else {
		gid("bgimage").style.filter = "blur(0px)";
	}
}

async function checksnapping(x, event) {
	if (await getSetting("wsnapping") != true) {
		return;
	}
	var cursorX = event.clientX;
	var cursorY = event.clientY;

	var viewportWidthInPixels = window.innerWidth;
	var viewportHeightInPixels = window.innerHeight;

	var VWInPixels = (3 * viewportWidthInPixels) / 100;
	var VHInPixels = (3 * viewportHeightInPixels) / 100;

	if (fulsapp) {
		x.classList.add("snapping");
		x.getElementsByClassName("flbtn")[0].innerHTML = "open_in_full";
		x.style = 'left: calc(50vw - 33.5vw); top: calc(50vh - 35vh); width: 65vw; height: 70vh; z-index: 0;';
		fulsapp = false;
		setTimeout(() => {
			x.classList.remove("snapping");
		}, 1000);
	}

	if (cursorY < VHInPixels || (viewportHeightInPixels - cursorY) < VHInPixels) {
		x.classList.add("snapping");
		x.style.width = "calc(100% - 0px)";
		x.style.height = "calc(100% - 60px)";
		x.style.top = "0";
		x.style.right = "0";
		x.style.left = "0";

		fulsapp = true;
		x.getElementsByClassName("flbtn")[0].innerHTML = "close_fullscreen";
		setTimeout(() => {
			x.classList.remove("snapping");
		}, 1000);
	}

	// left
	if (cursorX < VWInPixels) {
		x.classList.add("snapping");
		x.style = "left: 0; top: 0; width: calc(50% - 0px); height: calc(100% - 50px);";
		fulsapp = true;
		x.getElementsByClassName("flbtn")[0].innerHTML = "open_in_full";
		setTimeout(() => {
			x.classList.remove("snapping");
		}, 1000);
	}

	// right
	if ((viewportWidthInPixels - cursorX) < VWInPixels) {
		x.classList.add("snapping");
		x.style = "right: 0; top: 0; width: calc(50% - 0px); height: calc(100% - 50px);";
		fulsapp = true;
		x.getElementsByClassName("flbtn")[0].innerHTML = "open_in_full";
		setTimeout(() => {
			x.classList.remove("snapping");
		}, 1000);
	}
}

let countdown, countdown2;
var sleepQuotes = [
	"A quick nap is all you need.",
	"Sweet dreams",
	"Just let it dissolve.",
	"You are empty",
	"Nothing disturbs you",
	"Stay Calm",
	"Breath In",
	"Breath out",
	"Slowly relax your body"
]

function startTimer(minutes) {
	document.getElementById("sleepbtns").style.display = "none";
	clearInterval(countdown);
	clearInterval(countdown2);
	const now = Date.now();
	const then = now + minutes * 60 * 1000;
	displayTimeLeft(minutes * 60);
	countdown = setInterval(() => {
		const secondsLeft = Math.round((then - Date.now()) / 1000);
		if (secondsLeft <= 0) {
			clearInterval(countdown);
			document.getElementById('sleeptimer').textContent = '00:00';
			playBeeps();
			document.getElementById('sleepwindow').close()
			return;
		}

		displayTimeLeft(secondsLeft);
	}, 1000);
	countdown2 = setInterval(() => {
		const randomIndex = Math.floor(Math.random() * sleepQuotes.length);

		gid("sleepquote").innerHTML = sleepQuotes[randomIndex];
	}, 3000);
}

function playBeeps() {
	const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

	for (let i = 0; i < 6; i++) {
		const oscillator = audioCtx.createOscillator();
		oscillator.type = 'sine';
		oscillator.frequency.value = 1000;
		oscillator.connect(audioCtx.destination);

		setTimeout(() => {
			oscillator.start();
			setTimeout(() => oscillator.stop(), 100);
		}, i * 200);
	}
}

async function setMessage() {
	const message = await ask('What should be the message?', 'Do not disturb...');
	document.getElementById('sleepmessage').innerHTML = message;
}

function displayTimeLeft(seconds) {
	const minutes = Math.floor(seconds / 60);
	const remainderSeconds = seconds % 60;
	const display = `${minutes}:${remainderSeconds < 10 ? '0' : ''}${remainderSeconds}`;
	document.getElementById('sleeptimer').textContent = display;
}


function notify(title, description, appname) {
	if (document.getElementById("notification").style.display == "block") {
		document.getElementById("notification").style.display = "none";
		setTimeout(notify(title, description, appname), 500)
	}

	var appnameb = document.getElementById('notifappName');
	var descb = document.getElementById('notifappDesc');
	var titleb = document.getElementById('notifTitle');

	if (appnameb && descb && titleb) {
		appnameb.innerText = appname;
		descb.innerText = description;
		titleb.innerText = title;
		const windValues = Object.values(winds).map(Number);

		// Calculate the maximum value from the array
		const maxWindValue = Math.max(...windValues);

		// Set the zIndex
		document.getElementById("notification").style.zIndex = maxWindValue + 1;
		document.getElementById("notification").style.display = "block";
		setTimeout(function () {
			document.getElementById("notification").style.display = "none";
		}, 5000);
	} else {
		console.error("One or more DOM elements not found.");
	}
    const notificationID = genUID();
    notifLog[notificationID] = { title, description, appname };
}

function displayNotifications() {
    const notifList = document.getElementById("notiflist");
    notifList.innerHTML = "";

    Object.values(notifLog).forEach(({ title, description, appname }) => {
        const notifDiv = document.createElement("div");
        notifDiv.className = "notification";

        const titleDiv = document.createElement("div");
        titleDiv.className = "notifTitle";
        titleDiv.innerText = title;

        const descDiv = document.createElement("div");
        descDiv.className = "notifDesc";
        descDiv.innerText = description;

        const appNameDiv = document.createElement("div");
        appNameDiv.className = "notifAppName";
        appNameDiv.innerText = appname;

        notifDiv.appendChild(titleDiv);
        notifDiv.appendChild(descDiv);
        notifDiv.appendChild(appNameDiv);
        notifList.appendChild(notifDiv);
    });
}

function runAsOSL(content) {
	const encodedContent = encodeURIComponent(content).replace(/'/g, "%27").replace(/"/g, "%22");
	const cont = `<iframe class="oslframe" src="https://origin.mistium.com/Versions/originv4.9.2.html?embed=${encodedContent}"></iframe>
	<style>
		.oslframe {
			width: 100%;
			height: 100%;
			border: none;
		}
	</style>`;
	openwindow("Nova OSL Runner", cont);
}


function runAsWasm(content) {
	const wasmBytes = new Uint8Array(content);

	const div = document.createElement('div');
	const script = document.createElement('script');
	script.innerHTML = `
		function greenflag() {
			const memory = new WebAssembly.Memory({ initial: 1 });
			const imports = { env: { memory: memory } };
			const wasmCode = new Uint8Array([${Array.from(wasmBytes)}]);

			WebAssembly.instantiate(wasmCode, imports)
				.then(obj => {
					console.log(obj.instance.exports.memory);
					// Additional code to execute the WebAssembly module as needed
				})
				.catch(err => console.error(err));
		}
	`;
	div.appendChild(script);


	openwindow("Nova Wasm Runner", div.innerHTML);
}


// hotkeys
document.addEventListener('keydown', function (event) {
	if (event.ctrlKey && (event.key === 'f' || event.keyCode === 70)) {
		event.preventDefault();
		openapp('files', 1);
	}
	if (event.ctrlKey && (event.key === 's')) {
		event.preventDefault();
		openapp('settings', 1);
	}
});


document.addEventListener('keydown', function (event) {
	if (event.key === 'Escape') {
		var appdmod = document.getElementById('appdmod');
		if (appdmod && appdmod.open) {
			appdmod.close();
		}
	}
});

document.addEventListener('keydown', function (event) {
	if (event.ctrlKey && event.key === '/') {
		event.preventDefault();
		opensearchpanel();
	}
});

document.addEventListener('keydown', function (event) {
	if (event.ctrlKey && event.key === ' ') {
		event.preventDefault();
		openn();
	}
});


async function genTaskBar() {
	var appbarelement = document.getElementById("dock")
	appbarelement.innerHTML = ""
	if (appbarelement) {
		let x = await getFileNamesByFolder("Dock");
		if (x.length == 0) {
			let y = await getFileNamesByFolder("Apps");

			x = await Promise.all(y.map(async (item) => {
				if (item.name === "files.app" || item.name === "settings.app" || item.name === "store.app") {
					return item;
				}
			}));

			x = x.filter(item => item);

		}
		let index = 0;
		x.forEach(async function (app, index) {
			index++
			var islnk = false;
			// Create a div element for the app shortcut
			var appShortcutDiv = document.createElement("biv");
			appShortcutDiv.className = "app-shortcut tooltip adock sizableuielement";
			app = await getFileById(app.id)

			if (app.type == "lnk") {
				let z = JSON.parse(app.content);
				app = await getFileById(z.open)
				islnk = true;
			}

			appShortcutDiv.setAttribute("onclick", "openfile('" + app.id + "')");
			var iconSpan = document.createElement("span");

			if (!appicns[app.fileName]) {
				// Unshrink the content
				const unshrunkContent = unshrinkbsf(app.content);

				// Use the getAppIcon function to fetch the icon
				const icon = getAppIcon(unshrunkContent, app.fileName);

				if (icon) {
					iconSpan.innerHTML = icon;
				} else {
					iconSpan.innerHTML = defaultAppIcon;
				}
			} else {
				iconSpan.innerHTML = appicns[app.fileName];
			}

			var tooltisp = document.createElement("span");
			tooltisp.className = "tooltiptext";
			tooltisp.innerHTML = islnk ? app.fileName + `*` : app.fileName;

			// Append both spans to the app shortcut container
			appShortcutDiv.appendChild(iconSpan);
			appShortcutDiv.appendChild(tooltisp);

			appbarelement.appendChild(appShortcutDiv);
		})
	}
}

makedialogclosable('searchwindow');
prepareArrayToSearch()
async function opensearchpanel() {
	gid('searchwindow').showModal()
	if (await getSetting("smartsearch")) {
		gid('searchiconthingy').style = `background: linear-gradient(-34deg, #79afff, #f66eff);opacity: 1; color: white;padding: 0.1rem 0.3rem; margin: 0.3rem; border-radius: 0.5rem;aspect-ratio: 1 / 1;display: grid;cursor: default; margin-right: 0.5rem;box-shadow: 0 0 6px inset #ffffff6b;`
	} else {
		gid('searchiconthingy').style = ``;
	}
	if (window.innerWidth > 500) {
		gid("strtsear").focus()
	}
	gid("strtsear").value = "";
	loadrecentapps();
	displayNotifications();
	
	gid("seapppreview").style.display = "none";
	
	if (appsHistory.length > 0) {
		gid("partrecentapps").style.display = "block";
	} else {
		gid("partrecentapps").style.display = "none";
		document.querySelector(".previewsside").style.display = "none";
	}
}

function mtpetxt(str) {
	if (!str) {
		return;
	}
	try {
		const parts = str.split('.');
		return parts.length > 1 ? parts.pop() : '';
	} catch (err) {
		console.error(err)
	}
}

function ptypext(str) {
	try {
		const parts = str.split('.');
		return parts.length > 1 ? parts.pop() : '';
	} catch { }
}

function getbaseflty(ext) {
	if (mtpetxt(ext) != '') {
		ext = mtpetxt(ext);
	}
	switch (ext) {
		case 'mp3':
		case 'mpeg':
		case 'wav':
		case 'flac':
			return 'music';

		case 'mp4':
		case 'avi':
		case 'mov':
		case 'mkv':
			return 'video';

		case 'jpg':
		case 'jpeg':
		case 'png':
		case 'gif':
		case 'bmp':
		case 'webp':
			return 'image';

		case 'txt':
		case 'doc':
		case 'docx':
		case 'pdf':
		case 'html':
			return 'document';

		case 'app':
			return 'app';

		case 'cpp':
		case 'py':
		case 'css':
		case 'js':
		case 'json':
			return 'code'

		case 'html':
			return 'webpage'

		default:
			return ext;
	}
}

function basename(str) {
	try {
		const parts = str.split('.');
		if (parts.length > 1) {
			parts.pop(); // Remove the extension
			return parts.join('.'); // Rejoin the remaining parts
		}
		return str; // No extension present
	} catch { }
}

function closeallwindows() {
	Object.keys(winds).forEach(key => {
		const taskId = key.slice(-6); // Extract the last 6 characters as the task ID

		const taskName = key.slice(0, -6); // Remove the last 6 characters from the key
		clwin("window" + taskId);
		delete winds[taskName + taskId];
	});
	gid("closeallwinsbtn").checked = true;
}

async function checkifpassright() {
	lethalpasswordtimes = true;
	var trypass = gid("loginform1").value;
	if (await checkPassword(trypass)) {
		gid('loginmod').close();
		password = trypass;
		startup();
	} else {
		gid("loginform1").classList.add("thatsnotrightcls");
		gid("loginform1").value = '';
		setTimeout(function () {
			gid("loginform1").classList.remove("thatsnotrightcls");
		}, 1000)
	}
	lethalpasswordtimes = false;
}

var chat;
function resetchat() {
	chat  = [{"role":"system","content":"You are NovaOS Copilot Assistant. NovaOS is a web OS that lets your run html apps and manage a local filesystem. You cannot use newlines (\n)"}];
}
resetchat()

const nvacopilot = {
  message: function(content, role) {
	const messagesContainer = document.getElementById("nvacoplt-messages");

	const messageDiv = document.createElement("div");
	messageDiv.classList.add("usermsg");

	if (role === "bot") {
	  messageDiv.classList.add("bot");
	}

	const navDiv = document.createElement("div");
	navDiv.classList.add("usermsg-nav");
	const icon = document.createElement("i");
	icon.classList.add("material-icons");
	icon.textContent = role === "bot" ? "auto_awesome" : "account_circle";
	navDiv.appendChild(icon);

	const contentDiv = document.createElement("div");
	contentDiv.classList.add("usermsg-content");
	contentDiv.innerHTML = markdownToHTML(content);

	messageDiv.appendChild(navDiv);
	messageDiv.appendChild(contentDiv);

	messagesContainer.appendChild(messageDiv);
	  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
};

nvacopilot.message("Hi there!", "user");
nvacopilot.message("Hello! How can I help you today?", "bot");

const sendMessage = () => {
  const messageInput = document.getElementById("nvacoplt-msginput");
  const messageContent = messageInput.value.trim();

  if (!messageContent) return;

  chat.push({"role": "user", "content": messageContent});
  nvacopilot.message(messageContent, "user");
  messageInput.value = "";

  const payload = {
	messages: chat,
	model: 'blackbox'
  };

  fetch('https://ai.milosantos.com/blackbox', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
	const responseMessage = data.choices[0].message.content;

	chat.push({"role": "assistant", "content": responseMessage});
	nvacopilot.message(responseMessage, "bot");
	if(responseMessage.includes("simply") || (responseMessage.includes("can") && (responseMessage.includes("by")))) {
		
nvacopilot.message("<small>Be aware following my instructions, i may make mistakes.</small>", "bot");
	}
  })
  .catch(error => {
	console.error('Error:', error);
	const errorMessage = 'An error occurred. Please try again.';

	chat.push({"role": "assistant", "content": errorMessage});
	nvacopilot.message(errorMessage, "bot");
  });
};

  document.getElementById("nvacoplt-msginput").addEventListener("keypress", e => {
	if (e.key === "Enter") sendMessage();
  });
  document.querySelector(".nvacoplt-sndbtn").addEventListener("click", sendMessage);

function markdownToHTML(markdown) {
  let html = markdown;

  html = html.replace(/(\*\*)(.*?)\1/g, '<strong>$2</strong>');

  html = html.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');

  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

  html = html.replace(/^\s*[-+*] (.*$)/gim, '<li>$1</li>');

	  html = html.replace(/```([^`]+)```/g, '<codeblock>$1</codeblock>');
	
	  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');

  html = html.replace(/  \n/g, '<br>');

  html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');

  return html.trim();
}

function logoutofnova() {
	memory = null;
	CurrentUsername = null;
	password = null;
	closeallwindows();
	showloginmod();
	lethalpasswordtimes = true;
	loginscreenbackbtn();
}