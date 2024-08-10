async function openlaunchprotocol(appid, data) {
	console.log("Open Lanuch Protocol", appid, data)
	let x = {
		"appid": appid,
		"data": data
	};
	Gtodo = x;
	openfile(x.appid, {data: Gtodo});
}


async function openfile(x, all) {
	console.log("opening: " + x)
	let unid= x;
	try {
		if (!unid) {
			console.error("No app id provided");
			return;
		}

		let mm = await getFileById(unid);
		// mm is the file
		if (!mm) {
			console.error("Error: File not found");
			return;
		}
		// extract type from file extension
		mm.type = ptypext(mm.fileName);

		if (all == 'any') {
            appIdToOpen = fileTypeAssociations['all'] || null;
			openlaunchprotocol(appIdToOpen, unid);
			return;
		}

		if (mm.type == "app") {
			// run the app if it is one
			await openapp(mm.fileName, unid);
		} else if (mm.type == "osl") {
			runAsOSL(mm.content)
		} else if (mm.type == "lnk") {
			let z = JSON.parse(mm.content);
			openfile(z.open)
		} else {
            // Not a .lnk file or an .osl file nor an .app file.
            let appIdToOpen = null;
            const fileExtension = mm.fileName.substring(mm.fileName.lastIndexOf('.'));

            appIdToOpen = fileTypeAssociations[fileExtension] || null;
		
			if (!appIdToOpen) {
					appIdToOpen = fileTypeAssociations['all'] || null;
					openlaunchprotocol(appIdToOpen, unid);
			} else {
				openlaunchprotocol(appIdToOpen, unid);
			}
		}
	} catch (error) {
		console.error(":( Error:", error);
		say("<h1>Unable to open file</h1>File Error: " + error, "failed")
	}
}

function openwindow(title, cont, ic, theme, appid, params) {
	appsHistory.push(title)
	if (appsHistory.length > 5) {
		appsHistory = appsHistory.slice(-5);
	}

	if (winds.length > 3) {
		notify("Over 100 tabs is open.", "Even if your pc can handle it - this is cringe.")
	}

	content = cont
	if (content == undefined) {
		content = "<center><h1>Unavailable</h1>App Data cannot be read.</center>";
	}

	let winuid = genUID();
	winds[title + winuid] = 1;

	// Create the window element
	var windowDiv = document.createElement("div");
	windowDiv.id = "window" + winuid;


	windowDiv.setAttribute("data-winds", title + winuid);
	windowDiv.onclick = function () {
		nowapp = title;
		dewallblur();
	}
	nowapp = title;
	dewallblur();
	windowDiv.classList += "window";

	let isitmob = window.innerWidth <= 500;

	if (!isitmob) {
		windowDiv.style = 'left: calc(50vw - 33.5vw); top: calc(50vh - 35vh); width: 65vw; height: 70vh; z-index: 0;';

		// Get the computed style of the windowDiv
		let computedStyle = getComputedStyle(windowDiv);

		// Get the current positions calculated by the browser
		let currentLeft = parseFloat(computedStyle.left);
		let currentTop = parseFloat(computedStyle.top);

		// Update the positions
		let newLeft = `calc(50vw - 33.5vw + ${5 * Object.keys(winds).length}px)`;
		let newTop = `calc(50vh - 35vh + ${5 * Object.keys(winds).length}px)`;

		windowDiv.style.left = newLeft;
		windowDiv.style.top = newTop;

	} else {
		windowDiv.style.left = 0;
		windowDiv.style.top = 0;
		windowDiv.style.width = 'calc(100% - 0px)';
		windowDiv.style.height = 'calc(100% - 58px)';
	}

	// Create the window header
	var windowHeader = document.createElement("div");
	windowHeader.id = "window" + winuid + "header"
	windowHeader.classList += "windowheader";
	let windowdataspan = document.createElement("div");
	windowdataspan.classList += "windowdataspan";
	windowdataspan.innerHTML = ic != null ? ic : "";
	let windowtitlespan = document.createElement("div");
	windowtitlespan.innerHTML += toTitleCase(basename(title));
	windowdataspan.appendChild(windowtitlespan);
	windowHeader.appendChild(windowdataspan);
	if (theme != null) {
		windowHeader.style.backgroundColor = theme;
		windowDiv.style.border = `1px solid ` + theme;
		if (isDark(theme)) {
			windowHeader.style.color = "white";
		} else {
			windowHeader.style.color = "black";
		}
	}
	windowHeader.setAttribute("title", title + winuid)
	windowHeader.addEventListener("mouseup", function (event) {
		let target = event.target;
		while (target) {
			if (target.classList && target.classList.contains('wincl')) {
				return;
			}
			target = target.parentElement;
		}
		checksnapping(windowDiv, event);
	});
	

	windowDiv.addEventListener("mousedown", function (event) {
		putwinontop('window' + winuid);
		winds[title + winuid] = windowDiv.style.zIndex;
	});

	var ibtnsside = document.createElement("div");
	ibtnsside.classList += "ibtnsside"

	var flButton = document.createElement("span");
	flButton.classList.add("material-symbols-rounded", "wincl", "flbtn");
	flButton.style = `    padding: 4px 5px;
    font-size: 8px !important;`;
	flButton.textContent = "open_in_full";
	flButton.onclick = function () {
		flwin(flButton);
	};

	// Create the close button in the header
	var closeButton = document.createElement("span");
	closeButton.classList.add("material-symbols-rounded", "wincl");
	closeButton.textContent = "close";
	closeButton.onclick = function () {
		setTimeout(function () {
			dewallblur();
		}, 500);
		clwin("window" + winuid);
		delete winds[title + winuid];
		loadtaskspanel()
	};

	// Append the close button to the header
	ibtnsside.appendChild(closeButton);
	if (!isitmob) { ibtnsside.appendChild(flButton); }

	windowHeader.appendChild(ibtnsside);

	var windowContent = document.createElement("div");
	windowContent.classList += "windowcontent";

	var windowLoader = document.createElement("div");
	windowLoader.classList += "windowloader";
	var loaderdiv = document.createElement("div");
	loaderdiv.classList = "loader33";
	windowLoader.innerHTML = appicns[title] ? appicns[title] : defaultAppIcon;
	windowLoader.appendChild(loaderdiv);


	function loadIframeContent(windowLoader, windowContent, iframe) {
		var iframe = document.createElement("iframe");
		var contentString = content.toString();

		// Decode the content string if it's Base64 encoded
		if (isBase64(contentString)) {
			contentString = decodeBase64Content(contentString);
		}

		const script = `
        <script>
            document.addEventListener('mousedown', function(event) {
                window.parent.postMessage({ type: 'iframeClick', iframeId: '${winuid}' }, '*');
            });
        </script>
    `;
    contentString = contentString.replace('</body>', script + '</body>');

		// Create a Blob from the content string
		var blob = new Blob([contentString], { type: 'text/html' });

		// Create a URL for the Blob
		var blobURL = URL.createObjectURL(blob);

		iframe.onload = function () {
			iframe.contentWindow.myWindow = {
				element: windowDiv,
				titleElement: windowtitlespan,
				appID: appid,
				...(params && { params })
			};

			try { iframe.contentWindow.greenflag(); } catch {}
			
			windowLoader.remove();
		};

		iframe.src = blobURL;

		windowContent.appendChild(iframe);
		window.addEventListener('message', function(event) {
			if (event.data.type === 'iframeClick' && event.data.iframeId === winuid) {
				putwinontop('window' + winuid);
				winds[title + winuid] = windowDiv.style.zIndex;
			}
		});
	}

	nowwindow = 'window' + winuid;
	// Append the header and content to the window
	windowDiv.appendChild(windowHeader);
	windowDiv.appendChild(windowContent);
	windowDiv.appendChild(windowLoader);

	// Append the window to the document body
	document.body.appendChild(windowDiv);

	// Initial load
	loadIframeContent(windowLoader, windowContent);

	dragElement(windowDiv);
	putwinontop('window' + winuid);
	loadtaskspanel();
}

async function openapp(x, od) {
    // od is the app id, x is the app name
        if (gid('appdmod').open) {
            gid('appdmod').close()
        }
        if (gid('searchwindow').open) {
            gid('searchwindow').close()
        }
    
        const fetchDataAndSave = async (x) => {
            try {
                var y;
                if (od == 1) {
					y = await fetchData("appdata/" + x + ".html");
                    od = await createFile("Apps", x, "app", y);
                } 

				y = await getFileById(od)
				y = unshrinkbsf(y.content)
    
                // Assuming you have a predefined function openwindow
                openwindow(x, y, getAppIcon(y, x), getAppTheme(y), od, Gtodo);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
    
        // Call fetchDataAndSave with the desired value of x
        fetchDataAndSave(x);
    }