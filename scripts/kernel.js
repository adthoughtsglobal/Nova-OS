var dragging = false, windowData = {};

var novadotcsscache;

async function openlaunchprotocol(appid, data, id, winuid) {
    console.log("Open Lanuch Protocol", appid, data, id)
    let x = {
        "appid": appid,
        "data": data,
        "winuid": winuid
    };
    Gtodo = x;
    openfile(x.appid, { data: Gtodo });
}

function OLPreturn(fileID, transferID) {

    if (iframeReferences[transferID]) {
        iframeReferences[transferID].postMessage({ returned: fileID, id: transferID, action: 'loadlocalfile' }, '*');
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
                say("No apps installed can read this file. <br><br>Reinstall apps or 'open with' supporting applications.", "failed")
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
    const sizeStyles = isFullScreen ? 
        { width: 'calc(100% - 0px)', height: 'calc(100% - 57px)', left: '0', top: '0' } : 
        calculateWindowSize(aspectRatio);

    for (const [key, value] of Object.entries(sizeStyles)) {
        if (winElement.style[key] !== value) {
            winElement.style[key] = value;
        }
    }

    x.innerHTML = isFullScreen ? "close_fullscreen" : "open_in_full";

    setTimeout(() => {
        winElement.classList.remove("transp2");
    }, 1000);
}


function calculateWindowSize(aspectratio) {
    if (!aspectratio) aspectratio = "9/6";
    const [widthFactor, heightFactor] = aspectratio.split('/').map(Number);
    const aspectRatioValue = widthFactor / heightFactor;
    const maxVW = 90, maxVH = 90;

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

    const offset = 5 * Object.keys(winds).length;
    const left = `calc(50vw - ${widthVW / 2}vw + ${offset}px)`;
    const top = `calc(50vh - ${heightVH / 2}vh + ${offset}px)`;

    return { left, top, width: `${widthVW}vw`, height: `${heightVH}vh`};
}

async function openwindow(title, cont, ic, theme, aspectratio, appid, params) {
    appsHistory.push(title);
    if (appsHistory.length > 5) {
        appsHistory = appsHistory.slice(-5);
    }

    let winuid = genUID();
    winds[title + winuid] = 1;

    var windowDiv = document.createElement("div");
    windowDiv.id = "window" + winuid;
    windowDiv.setAttribute("data-winuid", winuid);
    windowDiv.onclick = function () {
        nowapp = title;
        dewallblur();
    };

    nowapp = title;
    dewallblur();
    windowDiv.classList += "window";

    const isitmob = window.innerWidth <= 500;
    const sizeStyles = !isitmob ? calculateWindowSize(aspectratio) : { left: '0', top: '0', width: 'calc(100% - 0px)', height: 'calc(100% - 58px)' };
    
    Object.assign(windowDiv.style, sizeStyles);

    (async function () {
        let x = await getSetting("WindowBgColor");
        windowDiv.style.background = (x) ? x : 'transparent';
    })();

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
    
    console.log(theme, "theme")
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
                console.log('wincl');
                return;
            }
            target = target.parentElement;
        }
        checksnapping(gid('window' + winuid), event);
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

    ibtnsside.appendChild(closeButton);
    if (!isitmob) {
        ibtnsside.appendChild(flButton);
    }
    ibtnsside.appendChild(minimbtn);

    windowHeader.appendChild(ibtnsside);

    var windowContent = document.createElement("div");
    windowContent.classList += "windowcontent";

    var windowLoader = document.createElement("div");
    windowLoader.classList += "windowloader";
    var loaderdiv = document.createElement("div");
    loaderdiv.classList = "loader33";

    async function loadIframeContent(windowLoader, windowContent, iframe) {
        const content2 = cont;
        let contentString = isBase64(content2) ? decodeBase64Content(content2) : content2;
    
        if (content2 === undefined) {
            contentString = "<center><h1>Unavailable</h1>App Data cannot be read.</center>";
        }
    
        if (windowLoader) {
            windowLoader.innerHTML = await getAppIcon(contentString, appid);
            windowLoader.appendChild(loaderdiv);
        }
    
        iframe = document.createElement("iframe");
        const blobURL = URL.createObjectURL(new Blob([contentString], { type: 'text/html' }));
    
        iframe.onload = async () => {
            iframeReferences[winuid] = iframe.contentWindow;
            
            iframe.contentWindow.myWindow = {
                element: windowDiv,
                eventBusWorker,
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

                    if (novadotcsscache == null) {
                        novadotcsscache = await fetch('nova.css');
                        novadotcsscache = await novadotcsscache.text()
                    }
                    var novadotcss = novadotcsscache;

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
                        '--colors-text-high': computedStyles.getPropertyValue('--colors-text-high'),
                        '--sizing-border-radius': computedStyles.getPropertyValue('--sizing-border-radius'),
                        '--sizing-normal': computedStyles.getPropertyValue('--sizing-normal'),
                        '--sizing-nano': computedStyles.getPropertyValue('--sizing-nano'),
                        '--vw': computedStyles.getPropertyValue('--vw'),
                        '--vh': computedStyles.getPropertyValue('--vh'),
                        '--font-size-default': computedStyles.getPropertyValue('--font-size-default')
                    };

                    const updatedCssText = novadotcss.replace(/:root\s*{([^}]*)}/, (match, declarations) => {
                        let updatedDeclarations = declarations.trim();
                        for (const [variable, value] of Object.entries(variables)) {
                            const regex = new RegExp(`(${variable}\\s*:\\s*).*?;`, 'g');
                            updatedDeclarations = updatedDeclarations.replace(regex, `$1${value.trim()};`);
                        }
                        return `:root { ${updatedDeclarations} }`;
                    });

                    const style = document.createElement('style');
                    style.textContent = updatedCssText;
                    iframe.contentDocument.head.appendChild(style);
                } catch (error) {
                    console.error('Error fetching or injecting CSS:', error);
                }
            }

        const script = document.createElement('script');
        script.innerHTML = `
            document.addEventListener('mousedown', function(event) {
                window.parent.postMessage({ type: 'iframeClick', iframeId: '${winuid}' }, '*');
            });
        `;
        iframe.contentDocument.body.appendChild(script);

        let greenflagResult;
        try {
            greenflagResult = iframe.contentWindow.greenflag();
        } catch (e) {
            if (!e.message.includes("greenflag")) {
                console.warn(e);
            }
        }

        if (windowLoader) {
            windowLoader.classList.add("transp5");
            setTimeout(() => {
                windowLoader.remove();
            }, 700);
        }
        URL.revokeObjectURL(blobURL);
    };

    iframe.src = blobURL;
    if (!windowData[winuid]) windowData[winuid] = {};
    windowData[winuid]["src"] = blobURL;
    
    windowContent.appendChild(iframe);

    window.addEventListener('message', function (event) {
        if (event.data.type === 'iframeClick' && event.data.iframeId === winuid) {
            putwinontop('window' + winuid);
            winds[title + winuid] = windowDiv.style.zIndex;
        }
    });
}

    nowwindow = 'window' + winuid;
    windowDiv.appendChild(windowHeader);
    windowDiv.appendChild(windowContent);
    windowDiv.appendChild(windowLoader);

    document.body.appendChild(windowDiv);

    loadIframeContent(windowLoader, windowContent);

    dragElement(windowDiv);
    putwinontop('window' + winuid);
    loadtaskspanel();
}
async function checksnapping(x, event) {
    const logData = {
        x: x,
        eventType: event.type,
        cursorX: event.clientX,
        cursorY: event.clientY,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        wsnappingSetting: await getSetting("wsnapping"),
        isFullScreen: fulsapp,
    };

    if (!logData.wsnappingSetting) return;

    const VWInPixels = (3 * logData.viewportWidth) / 100;
    const VHInPixels = (3 * logData.viewportHeight) / 100;
    const aspectRatioValue = 9 / 6;
    const maxWidthPx = (logData.viewportWidth * 100) / 100;
    const maxHeightPx = (logData.viewportHeight * 100) / 100;
    let heightPx = (maxHeightPx / 100) * 70;
    let widthPx = heightPx * aspectRatioValue;

    if (widthPx > maxWidthPx) {
        widthPx = maxWidthPx;
        heightPx = widthPx / aspectRatioValue;
    }

    const widthVW = (widthPx / logData.viewportWidth) * 100;
    const heightVH = (heightPx / logData.viewportHeight) * 100;

    logData.VWInPixels = VWInPixels;
    logData.VHInPixels = VHInPixels;
    logData.widthPx = widthPx;
    logData.heightPx = heightPx;
    logData.widthVW = widthVW;
    logData.heightVH = heightVH;

    const resetWindow = () => {
        x.classList.add("snapping");
        
        const aspectRatio = x.getAttribute("data-aspectratio") || "9/6";
        const sizeStyles = calculateWindowSize(aspectRatio);
    
        Object.assign(x.style, sizeStyles);
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
        fulsapp = true;
        x.getElementsByClassName("flbtn")[0].innerHTML = "close_fullscreen";
        setTimeout(() => {
            x.classList.remove("snapping");
        }, 1000);
    };

    if (fulsapp) resetWindow();

    if (logData.cursorY < VHInPixels || (logData.viewportHeight - logData.cursorY) < VHInPixels) {
        maximizeWindow();
    } else if (logData.cursorX < VWInPixels) {
        x.classList.add("snapping");
        x.style = `left: 0; top: 0; width: calc(50% - 0px); height: calc(100% - 50px);`;
        fulsapp = true;
        x.getElementsByClassName("flbtn")[0].innerHTML = "open_in_full";
        setTimeout(() => {
            x.classList.remove("snapping");
        }, 1000);
    } else if ((logData.viewportWidth - logData.cursorX) < VWInPixels) {
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
    var iframeOverlay = null;

    if (gid(elmnt.id + "header")) {
        gid(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        if (isInsideIbtnsSide(e.target)) {
            return;
        }
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        iframeOverlay = document.createElement('div');
        iframeOverlay.style.position = 'absolute';
        iframeOverlay.style.top = 0;
        iframeOverlay.style.left = 0;
        iframeOverlay.style.width = '100%';
        iframeOverlay.style.height = '100%';
        iframeOverlay.style.zIndex = 999;
        iframeOverlay.style.backgroundColor = 'transparent';
        iframeOverlay.style.cursor = 'grabbing';
        document.body.appendChild(iframeOverlay);

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

    function closeDragElement(event) {
        document.onmouseup = null;
        document.onmousemove = null;
    
        if (iframeOverlay) {
            document.body.removeChild(iframeOverlay);
            iframeOverlay = null;
        }
    
        const mouseUpEvent = new MouseEvent('mouseup', {
            clientX: event.clientX,
            clientY: event.clientY,
        });
        gid(elmnt.id + "header").dispatchEvent(mouseUpEvent);
    }

    function isInsideIbtnsSide(target) {
        while (target) {
            if (target.classList && target.classList.contains('ibtnsside')) {
                return true;
            }
            target = target.parentElement;
        }
        return false;
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
                od = await createFile("Apps/", toTitleCase(x), "app", y);
            } else {
                y = await getFileById(od);
                y = y.content;
            }
            openwindow(x, y, await getAppIcon(y, x), getAppTheme(y), getAppAspectRatio(y), od, Gtodo);
            Gtodo = null;
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
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