gid("mm").innerHTML = `<svg class="mmic" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="22.93098" height="43.31773" viewBox="0,0,22.93098,43.31773"><g transform="translate(-228.53451,-158.34114)"><g data-paper-data="{&quot;isPaintingLayer&quot;:true}" id='novaic' fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="0" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" style="mix-blend-mode: normal"><path d="M228.68924,195.01197l-0.15473,-36.67083l19.03116,29.04225l0.00895,-17.05191l3.55036,-5.02752l0.3405,36.35491c0,0 -18.13437,-29.80707 -18.13437,-29.23736c0,5.15736 -0.30946,16.4013 -0.30946,16.4013z"/></g></g></svg>`;

// Declare variables for elements
const flodivElement2 = document.getElementsByClassName("flodiv")[0];
const flodivElements = document.querySelectorAll('[navobj]');
const appdmodElement = document.getElementById("appdmod");
const novaicElement = document.getElementById('novaic');
const searchinpe = document.getElementById('strtsear');
const searchnbtn = document.getElementById('strtsearcontbtn');


// dark mode
function checkdmode() {
	let x = localStorage.getItem("qsets");
	if (x) {
		if (JSON.parse(x).darkMode) {
			if (JSON.parse(x).simpleMode) {
				switchtheme("dark", "simple");
			} else {
				switchtheme("dark");
			}
		} else {
			if (JSON.parse(x).simpleMode) {
				switchtheme("bright", "simple");
			} else {
				switchtheme("bright");
			}
		}
	}
}

function switchtheme(x, y) {
	if (x == "dark") {
		// dark mode
		flodivElements.forEach(element => {
			element.style.background = "#00000078";
		});
		appdmodElement.style.background = "#00000091";
		searchinpe.style.color = "white";
		searchinpe.style.backgroundColor = "#2a2929";
		searchnbtn.style.background = "rgba(0, 0, 0, 0.13)"
		searchnbtn.style.color = "#878787"
	} else {
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
			novaicElement.setAttribute('fill', 'white');
			appdmodElement.style.backdropFilter = "none";
			appdmodElement.style.background = "#333333";
			appdmodElement.style.color = "white";
			searchnbtn.style.background = "rgb(42, 41, 41)"
			searchnbtn.style.color = "#878787"
		} else {
			novaicElement.setAttribute('fill', 'rgb(91 91 91)');
			appdmodElement.style.backdropFilter = "none";
			appdmodElement.style.background = "#f2f9ff";
			appdmodElement.style.color = "rgb(91 91 91)";
			searchnbtn.style.background = "rgb(229, 229, 229)"
			searchnbtn.style.color = "#878787"
		}
	} else {
		// non-simple
		flodivElements.forEach(element => {
			element.style.backdropFilter = "blur(10px)";
			element.style.color = "white";
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
