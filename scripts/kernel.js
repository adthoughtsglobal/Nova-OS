var dragging = false;

async function openlaunchprotocol(appid, data, id, winuid) {
    console.log("Open Lanuch Protocol", appid, data,id)
    let x = {
        "appid": appid,
        "data": data,
        "winuid":winuid
    };
    Gtodo = x;
    openfile(x.appid, { data: Gtodo });
}

function OLPreturn(fileID, transferID) {
    
    if (iframeReferences[transferID]) {
        iframeReferences[transferID].postMessage({returned:fileID, id:transferID, action:'loadlocalfile'}, '*');
      }
}

const iframeReferences = {};

async function openfile(x) {
    let unid = x;
    try {
        if (!unid) {
            console.error("No app id provided");
            return;
        }

        let mm = await getFileById(unid);
        // mm is the file
        if (!mm) {
            console.error("Error: File not found", unid);
            return;
        }
        // extract type from file extension
        mm.type = ptypext(mm.fileName);

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

            if (fileTypeAssociations[fileExtension] && fileTypeAssociations[fileExtension].length > 0) {
                appIdToOpen = fileTypeAssociations[fileExtension][0];
            } else if (fileTypeAssociations['all'] && fileTypeAssociations['all'].length > 0) {
                appIdToOpen = fileTypeAssociations['all'][0];
            }

            if (appIdToOpen) {
                openlaunchprotocol(appIdToOpen, unid);
            } else {
                
            }

        }
    } catch (error) {
        console.error(":( Error:", error);
        say("<h1>Unable to open file</h1>File Error: " + error, "failed")
    }
}


function flwin(x) {
    const winElement = x.parentElement.parentElement.parentElement;
    winElement.classList.add("transp2");

    const isFullScreen = x.innerHTML === "open_in_full";
    const aspectRatio = winElement.getAttribute("data-aspectratio") || "9/6";
    const [widthFactor, heightFactor] = aspectRatio.split('/').map(Number);
    const aspectRatioValue = widthFactor / heightFactor;
    const maxVW = 100, maxVH = 100;

    if (isFullScreen) {
        winElement.style.width = `calc(${maxVW}% - 0px)`;
        winElement.style.height = `calc(${maxVH}% - 57px)`;
        winElement.style.left = "0";
        winElement.style.top = "0";
        x.innerHTML = "close_fullscreen";
    } else {
        const maxWidthPx = (window.innerWidth * maxVW) / 100;
        const maxHeightPx = (window.innerHeight * maxVH) / 100;

        let heightPx = (maxHeightPx / 100) * 70;
        let widthPx = heightPx * aspectRatioValue;

        if (widthPx > maxWidthPx) {
            widthPx = maxWidthPx;
            heightPx = widthPx / aspectRatioValue;
        }

        const widthVW = (widthPx / window.innerWidth) * 100;
        const heightVH = (heightPx / window.innerHeight) * 100;

        winElement.style.width = `${widthVW}vw`;
        winElement.style.height = `${heightVH}vh`;
        winElement.style.left = `calc(50vw - ${widthVW / 2}vw)`;
        winElement.style.top = `calc(50vh - ${heightVH / 2}vh)`;
        x.innerHTML = "open_in_full";
    }

    setTimeout(() => {
        winElement.classList.remove("transp2");
    }, 1000);
}

async function openwindow(title, cont, ic, theme, aspectratio, appid, params) {
    appsHistory.push(title);
    if (appsHistory.length > 5) {
        appsHistory = appsHistory.slice(-5);
    }

    content = cont;
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
    };

    nowapp = title;
    dewallblur();
    windowDiv.classList += "window";

    let isitmob = window.innerWidth <= 500;

    if (!isitmob) {
        if (aspectratio == null) {
            aspectratio = "9/6";
        }
        
        let [widthFactor, heightFactor] = aspectratio.split('/').map(Number);
        let aspectRatioValue = widthFactor / heightFactor;
        
        const maxVW = 90;
        const maxVH = 90;
        
        const maxWidthPx = (window.innerWidth * maxVW) / 100;
        const maxHeightPx = (window.innerHeight * maxVH) / 100;
        
        let heightPx = (maxHeightPx / 100) * 70; 
        let widthPx = heightPx * aspectRatioValue; 
    
        if (widthPx > maxWidthPx) {
            widthPx = maxWidthPx;
            heightPx = widthPx / aspectRatioValue;
        }
        
        const widthVW = (widthPx / window.innerWidth) * 100;
        const heightVH = (heightPx / window.innerHeight) * 100;
        windowDiv.style = `left: calc(50vw - ${widthVW / 2}vw); top: calc(50vh - ${heightVH / 2}vh); width: ${widthVW}vw; height: ${heightVH}vh; z-index: 0;`;
        
        let offset = 5 * Object.keys(winds).length;
        let newLeft = `calc(50vw - ${widthVW / 2}vw + ${offset}px)`;
        let newTop = `calc(50vh - ${heightVH / 2}vh + ${offset}px)`;
        
        windowDiv.style.left = newLeft;
        windowDiv.style.top = newTop;
    } else {
        windowDiv.style.left = 0;
        windowDiv.style.top = 0;
        windowDiv.style.width = 'calc(100% - 0px)';
        windowDiv.style.height = 'calc(100% - 58px)';
    }

    (async function () {
        let x = await getSetting("WindowBgColor");
        windowDiv.style.background = (x) ? x : 'transparent';
    })();

    // Create the window header
    var windowHeader = document.createElement("div");
    windowHeader.id = "window" + winuid + "header";
    windowHeader.classList += "windowheader";
    let windowdataspan = document.createElement("div");
    windowdataspan.classList += "windowdataspan";
    windowdataspan.innerHTML = ic != null ? ic : "";
    let windowtitlespan = document.createElement("div");
    windowtitlespan.classList.add("title")
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
    windowHeader.setAttribute("title", title + winuid);
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

    windowDiv.addEventListener("mousedown", function () {
        putwinontop('window' + winuid);
        winds[title + winuid] = windowDiv.style.zIndex;
    });

    var ibtnsside = document.createElement("div");
    ibtnsside.classList += "ibtnsside";

    var minimbtn = document.createElement("span");
    minimbtn.classList.add("material-symbols-rounded", "wincl", "flbtn");
    minimbtn.textContent = "remove";
    minimbtn.setAttribute("title", "Minimize");
    minimbtn.onclick = function () {
        minim(minimbtn);
    };

    var flButton = document.createElement("span");
    flButton.classList.add("material-symbols-rounded", "wincl", "flbtn");
    flButton.textContent = "open_in_full";
    flButton.style = `padding: 4px 5px; font-size: 0.7rem !important;`;
    flButton.setAttribute("title", "Maximize");
    flButton.onclick = function () {
        flwin(flButton);
    };

    // Create the close button in the header
    var closeButton = document.createElement("span");
    closeButton.classList.add("material-symbols-rounded", "wincl", "winclosebtn");
    closeButton.textContent = "close";
    closeButton.setAttribute("title", "Close");
    closeButton.onclick = function () {
        setTimeout(function () {
            dewallblur();
        }, 500);
        clwin("window" + winuid);
        delete winds[title + winuid];
        loadtaskspanel();
    };

    // Append the close button to the header
    ibtnsside.appendChild(closeButton);
    if (!isitmob) {
        ibtnsside.appendChild(flButton);
    }
    ibtnsside.appendChild(minimbtn);

    windowHeader.appendChild(ibtnsside);

    var windowContent = document.createElement("div");
    windowContent.classList += "windowcontent";
    var contentString = isBase64(content) ? decodeBase64Content(content) : content;

    var windowLoader = document.createElement("div");
    windowLoader.classList += "windowloader";
    var loaderdiv = document.createElement("div");
    loaderdiv.classList = "loader33";
    windowLoader.innerHTML = await getAppIcon(contentString, appid);
    windowLoader.appendChild(loaderdiv);

    function loadIframeContent(windowLoader, windowContent, iframe) {
        const appstart = performance.now();
        var iframe = document.createElement("iframe");
        var blobURL = URL.createObjectURL(new Blob([contentString], { type: 'text/html' }));

        iframe.onload = async function () {
            iframeReferences[winuid] = iframe.contentWindow;
            iframe.contentWindow.myWindow = {
                element: windowDiv,
                close: () => {
                    clwin("window" + winuid);
                    delete winds[title + winuid];
                },
                titleElement: windowtitlespan,
                appID: appid,
                windowID: winuid,
                ...(params && { params })
            };
    
            if (contentString.includes("nova-include") && getMetaTagContent(contentString, 'nova-include') != null) {
                try {
                    const cssResponse = await fetch('nova.css');
const cssText = await cssResponse.text();

// Get the current root CSS variables from the body element
const computedStyles = getComputedStyle(document.body);
const variables = {
    '--font-size-small': computedStyles.getPropertyValue('--font-size-small'),
    '--font-size-normal': computedStyles.getPropertyValue('--font-size-normal'),
    '--font-size-big': computedStyles.getPropertyValue('--font-size-big'),
    '--colors-BG-normal': computedStyles.getPropertyValue('--colors-BG-normal'),
    '--colors-BG-sub': computedStyles.getPropertyValue('--colors-BG-sub'),
    '--colors-BG-section': computedStyles.getPropertyValue('--colors-BG-section'),
    '--colors-BG-highlighted': computedStyles.getPropertyValue('--colors-BG-highlighted'),
    '--colors-text-normal': computedStyles.getPropertyValue('--colors-text-normal'),
    '--sizing-border-radius': computedStyles.getPropertyValue('--sizing-border-radius'),
    '--sizing-normal': computedStyles.getPropertyValue('--sizing-normal'),
    '--sizing-nano': computedStyles.getPropertyValue('--sizing-nano'),
    '--vw': computedStyles.getPropertyValue('--vw'),
    '--vh': computedStyles.getPropertyValue('--vh'),
    '--font-size-default': computedStyles.getPropertyValue('--font-size-default')
};

// Replace root CSS variable declarations in the fetched CSS
const updatedCssText = cssText.replace(/:root\s*{([^}]*)}/, (match, declarations) => {
    let updatedDeclarations = declarations.trim();
    for (const [variable, value] of Object.entries(variables)) {
        const regex = new RegExp(`(${variable}\\s*:\\s*).*?;`, 'g');
        updatedDeclarations = updatedDeclarations.replace(regex, `$1${value.trim()};`);
    }
    return `:root { ${updatedDeclarations} }`;
});

// Inject the updated CSS into the iframe
const style = document.createElement('style');
style.textContent = updatedCssText;
iframe.contentDocument.head.appendChild(style);
                } catch (error) {
                    console.error('Error fetching or injecting CSS:', error);
                }
            }
    
            // Inject the JavaScript code
            const script = document.createElement('script');
            script.innerHTML = `
                document.addEventListener('mousedown', function(event) {
                    window.parent.postMessage({ type: 'iframeClick', iframeId: '${winuid}' }, '*');
                });
            `;
            iframe.contentDocument.body.appendChild(script);
    
            try {
                await iframe.contentWindow.greenflag();
            } catch (e) {
                console.error('Error during iframe initialization:', e);
            }
            
            const end = performance.now();
            console.log(`App startup took ${(end - appstart).toFixed(2)}ms`);
    
            windowLoader.remove();
        };

        iframe.src = blobURL;

        windowContent.appendChild(iframe);
        window.addEventListener('message', function (event) {
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
async function checksnapping(x, event) {
    if (await getSetting("wsnapping") !== true) {
        return;
    }

    const cursorX = event.clientX;
    const cursorY = event.clientY;
    const viewportWidthInPixels = window.innerWidth;
    const viewportHeightInPixels = window.innerHeight;

    const VWInPixels = (3 * viewportWidthInPixels) / 100;
    const VHInPixels = (3 * viewportHeightInPixels) / 100;

    // Fixed aspect ratio of 9/6
    const aspectRatioValue = 9 / 6;

    const maxVW = 100;
    const maxVH = 100;

    const maxWidthPx = (viewportWidthInPixels * maxVW) / 100;
    const maxHeightPx = (viewportHeightInPixels * maxVH) / 100;

    let heightPx = (maxHeightPx / 100) * 70;
    let widthPx = heightPx * aspectRatioValue;

    if (widthPx > maxWidthPx) {
        widthPx = maxWidthPx;
        heightPx = widthPx / aspectRatioValue;
    }

    const widthVW = (widthPx / viewportWidthInPixels) * 100;
    const heightVH = (heightPx / viewportHeightInPixels) * 100;

    const resetWindow = () => {
        x.classList.add("snapping");
        x.style = `left: calc(50vw - ${widthVW / 2}vw); top: calc(50vh - ${heightVH / 2}vh); width: ${widthVW}vw; height: ${heightVH}vh; z-index: 0;`;
        x.getElementsByClassName("flbtn")[0].innerHTML = "open_in_full";
        fulsapp = false;
        setTimeout(() => {
            x.classList.remove("snapping");
        }, 1000);
    };

    const maximizeWindow = () => {
        x.classList.add("snapping");
        x.style.width = "calc(100% - 0px)";
        x.style.height = "calc(100% - 60px)";
        x.style.top = "0";
        x.style.left = "0";
        x.style.right = "0";
        fulsapp = true;
        x.getElementsByClassName("flbtn")[0].innerHTML = "close_fullscreen";
        setTimeout(() => {
            x.classList.remove("snapping");
        }, 1000);
    };

    if (fulsapp) {
        resetWindow();
    }

    if (cursorY < VHInPixels || (viewportHeightInPixels - cursorY) < VHInPixels) {
        maximizeWindow();
    } else if (cursorX < VWInPixels) {
        x.classList.add("snapping");
        x.style = `left: 0; top: 0; width: calc(50% - 0px); height: calc(100% - 50px);`;
        fulsapp = true;
        x.getElementsByClassName("flbtn")[0].innerHTML = "open_in_full";
        setTimeout(() => {
            x.classList.remove("snapping");
        }, 1000);
    } else if ((viewportWidthInPixels - cursorX) < VWInPixels) {
        x.classList.add("snapping");
        x.style = `right: 0; top: 0; width: calc(50% - 0px); height: calc(100% - 50px);`;
        fulsapp = true;
        x.getElementsByClassName("flbtn")[0].innerHTML = "open_in_full";
        setTimeout(() => {
            x.classList.remove("snapping");
        }, 1000);
    }
}
function dragElement(elmnt) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	if (gid(elmnt.id + "header")) {
		gid(elmnt.id + "header").onmousedown = dragMouseDown;
	} else {
		elmnt.onmousedown = dragMouseDown;
	}

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;

		let newTop = elmnt.offsetTop - pos2;
		let newLeft = elmnt.offsetLeft - pos1;

		let boundaryTop = 0;
		let boundaryLeft = 0;
		let boundaryBottom = window.innerHeight - elmnt.offsetHeight;
		let boundaryRight = window.innerWidth - elmnt.offsetWidth;

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
		document.onmouseup = null;
		document.onmousemove = null;
	}
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
                od = await createFile("Apps", toTitleCase(x), "app", y);
            } else {
                y = await getFileById(od);
                y = y.content;
            }
            // Assuming you have a predefined function openwindow
            openwindow(x, y, await getAppIcon(y, x), getAppTheme(y), getAppAspectRatio(y), od, Gtodo);
            Gtodo = null;
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    // Call fetchDataAndSave with the desired value of x
    fetchDataAndSave(x);
}

function minim(x) {
    x.parentElement.parentElement.parentElement.classList.add("transp4")

    setTimeout(() => {
        x.parentElement.parentElement.parentElement.classList.remove("transp4")
        x.parentElement.parentElement.parentElement.style.display = "none";
        nowapp = '';
    }, 700);
}