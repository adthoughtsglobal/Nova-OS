function timeAgo(ms) {
	if (!ms) {
		return false;
	}
	let sec = Math.floor((Date.now() - ms) / 1000),
		min = Math.floor(sec / 60),
		hr = Math.floor(min / 60),
		day = Math.floor(hr / 24),
		mo = Math.floor(day / 30),
		yr = Math.floor(day / 365);
	
	return sec < 60 ? `${sec} seconds ago` :
	       min < 60 ? `${min} minutes ago` :
	       hr < 24 ? `${hr} hours ago` :
	       day < 30 ? `${day} days ago` :
	       mo < 12 ? `${mo} months ago` :
	       yr === 1 ? `a year ago` :
	       `${yr} years ago`;
}

function genUID() {
	const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_=+].,><;|?}{!@#$%^&*()';
	let randomString = '';
	for (let i = 0; i < 12; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		randomString += characters.charAt(randomIndex);
	}
	return randomString;
}

function isBase64(str) {
	try {
		function validateBase64(data) {
			const base64Pattern = /^[A-Za-z0-9+/=]+$/;
			if (!base64Pattern.test(data)) {
				return false;
			}
			const padding = data.length % 4;
			if (padding > 0) {
				data += '='.repeat(4 - padding);
			}
			atob(data);
			return true;
		}
		if (validateBase64(str)) {
			return true;
		}
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

function toTitleCase(str) {
	rp = str
	return str.toLowerCase().replace(/(?:^|\s)\w/g, function (match) {
		return match.toUpperCase();
	});
}

function isElement(element) {
	return element instanceof Element || element instanceof HTMLDocument;
}

function decodeBase64Content(str) {
	const base64Prefix = ';base64,';
	const prefixIndex = str.indexOf(base64Prefix);
	if (prefixIndex !== -1) {
		str = str.substring(prefixIndex + base64Prefix.length);
	}
	return isBase64(str) ? atob(str) : str;
}

function getfourthdimension() {
	return Date.now();
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
			parts.pop();
			return parts.join('.');
		}
		return str;
	} catch { }
}

function markdownToHTML(html) {
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

function stringToPastelColor(str) {
	if (!str) {
		return `rgb(255,255,255)`;
	}
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const r = (hash >> 24) & 0xFF;
    const g = (hash >> 16) & 0xFF;
    const b = (hash >> 8) & 0xFF;
    
    
    const pastelR = Math.min(255, r + 100);
    const pastelG = Math.min(255, g + 100);
    const pastelB = Math.min(255, b + 100);
    
    return `rgb(${pastelR}, ${pastelG}, ${pastelB})`;
  }

function ptypext(str) {
	try {
		const parts = str.split('.');
		return parts.length > 1 ? parts.pop() : '';
	} catch { }
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}