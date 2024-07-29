var databaseName = 'trojencat';
var CurrentUsername = 'user1';
var password = "nova";
const encoder = new TextEncoder();
const decoder = new TextDecoder();
var lethalpasswordtimes = true;

async function openDB(databaseName, version) {
    return new Promise((resolve, reject) => {
	  const request = indexedDB.open(databaseName, version);

	  request.onupgradeneeded = async (event) => {
		const db = event.target.result;

		if (!db.objectStoreNames.contains("dataStore")) {
		    db.createObjectStore("dataStore", { keyPath: 'key' });
		    console.log(`Object store created.`);
		    await saveMagicStringInLocalStorage(password);
		}
	  };

	  request.onsuccess = async (event) => {
		const db = event.target.result;

		if (db.version > 1) {
		    const dataToPreserve = await readAllData(db, 'dataStore');
		    db.close();

		    const deleteRequest = indexedDB.deleteDatabase(databaseName);
		    deleteRequest.onsuccess = () => {
			  const resetRequest = indexedDB.open(databaseName, 1);

			  resetRequest.onupgradeneeded = (resetEvent) => {
				const newDb = resetEvent.target.result;
				const objectStore = newDb.createObjectStore('dataStore', { keyPath: CurrentUsername });
				dataToPreserve.forEach(item => objectStore.add(item));
			  };

			  resetRequest.onsuccess = (resetEvent) => resolve(resetEvent.target.result);
			  resetRequest.onerror = (resetEvent) => reject(resetEvent.target.error);
		    };
		    deleteRequest.onerror = (deleteEvent) => reject(deleteEvent.target.error);
		} else {
		    resolve(db);
		}
	  };

	  request.onerror = (event) => reject(event.target.error);
    });
}

async function readAllData(db, storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.getAll();

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

async function getKey(password) {
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: encoder.encode("salt"),
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

async function encryptData(key, data) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoder.encode(data)
    );

    return {
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encrypted))
    };
}

async function decryptData(key, encryptedData) {
    const iv = new Uint8Array(encryptedData.iv);
    const data = new Uint8Array(encryptedData.data);

    try {
        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            data
        );

        return decoder.decode(decrypted);
    } catch (error) {
        console.error("Incorrect password or corrupted data", password, error);
        if (!lethalpasswordtimes) {
            document.body.innerHTML = `<div style="padding: 2rem;"><hitbx class="hitbox" title="time">
						<span id="time-display">time</span><br>
						<span id="date-display">date</span>
					</hitbx><h1>System Error</h1><p>We have found that<br>Your System is running on an incorrect password or corrupted data. This is what you can do about it:<br><br><button onclick="erdbsfull()">Erase all data</button><button onclick="location.reload()">Reload System</button></div><br><br>`;
        }
        throw error;
    }
}

async function setdb(value) {
	var databaseName = 'trojencat', key = 'dataStore';
    try {
	  const db = await openDB(databaseName, 1, {
		upgrade(db) {
		    if (!db.objectStoreNames.contains('dataStore')) {
			  db.createObjectStore('dataStore', { keyPath: 'CurrentUsername' });
		    }
		}
	  });

	  const cryptoKey = await getKey(password);
	  const encryptedValue = await encryptData(cryptoKey, JSON.stringify(value));

	  const transaction = db.transaction('dataStore', 'readwrite');
	  const store = transaction.objectStore('dataStore');
	  store.put({ key: CurrentUsername, value: encryptedValue } );

	  await new Promise((resolve, reject) => {
		transaction.oncomplete = resolve;
		transaction.onerror = () => reject(transaction.error);
		transaction.onabort = () => reject(transaction.error);
	  });

	  console.log(`Data for key '${key}' saved successfully.`);
    } catch (error) {
	  console.error("Error in setdb function:", error);
    }
}

async function getdb() {
    try {
	  const db = await openDB(databaseName, 1);
	  const transaction = db.transaction('dataStore', 'readonly');
	  const store = transaction.objectStore('dataStore');
	  const request = store.get(CurrentUsername);

	  return new Promise((resolve, reject) => {
		request.onsuccess = async () => {
		    if (request.result) {
			  try {
				const cryptoKey = await getKey(password);
				const decryptedValue = await decryptData(cryptoKey, request.result.value);
				memory = parseEscapedJsonString(decryptedValue);
				resolve(memory);
			  } catch (error) {
				console.error("Decryption error:", error);
				reject(error);
			  }
		    } else {
			  resolve(null);
		    }
		};

		request.onerror = () => reject(request.error);
	  });
    } catch (error) {
	  console.error("Error in getdb function:", error);
    }
}

function convertToMap(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    const map = new Map();
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            map.set(key, convertToMap(obj[key]));
        }
    }
    return map;
}
async function saveMagicStringInLocalStorage(password) {
    const cryptoKey = await getKey(password);
    const encryptedMagicString = await encryptData(cryptoKey, "magicString");

    localStorage.setItem('magicString', JSON.stringify(encryptedMagicString));
}

async function checkPassword(password) {
    const encryptedMagicString = JSON.parse(localStorage.getItem('magicString'));
    if (!encryptedMagicString) {
        console.error("Magic string not found in localStorage");
        return false;
    }

    const cryptoKey = await getKey(password);
    try {
        const decryptedMagicString = await decryptData(cryptoKey, encryptedMagicString);
        if (decryptedMagicString === "magicString") {
            console.log("Password verified successfully");
            return true;
        } else {
            console.error("Password verification failed: Data corrupted");
            return false;
        }
    } catch (error) {
        console.error("Password verification failed:", error.message);
        return false;
    }
}

async function getallusers() {
    try {
	  const db = await openDB(databaseName, 1);
	  const transaction = db.transaction('dataStore', 'readonly');
	  const store = transaction.objectStore('dataStore');
	  const request = store.getAllKeys();

	    return new Promise((resolve, reject) => {
		  request.onsuccess = async (event) => {
		    const result = await event.target.result;
		    
		    resolve(result);
		  };
		  request.onerror = () => {
		    
		    reject(request.error);
		  };
		});
    } catch (error) {
	  console.error("Error in getAllKeysFromStore function:", error);
    }
}

// settings store functions

var MemoryTimeCache = null;
let isFetchingMemory = false;

function getTime() {
    return Date.now();
}

async function updateMemoryData() {
    if (MemoryTimeCache === null || (getTime() - MemoryTimeCache) >= 5000) {
        if (!isFetchingMemory) {
            isFetchingMemory = true;
            console.log("Getting Memory");
            await getdb().then(result => {
                MemoryTimeCache = getTime();
                isFetchingMemory = false;
            }).catch(err => {
                console.error("Memory data unreadable");
                isFetchingMemory = false;
            });
        }
    }
}
function parseEscapedJsonString(escapedString) {

    // Remove the leading and trailing escaped quotes if they exist
    let leadingTrailingRemoved = escapedString.replace(/^"(.*)"$/, '$1');
    
    // Correctly handle multiple escapes
    let cleanedString = leadingTrailingRemoved;
    
    console.log('simpleparse string:', JSON.parse(cleanedString));

    try {
        return JSON.parse(cleanedString);
    } catch (e) {
        console.error('Invalid JSON string:', e);
        return null;
    }
}

  async function getdbWithDefault(databaseName, storeName, key, defaultValue) {
    try {
	  const db = await ensureObjectStore(databaseName, storeName);
	  const transaction = db.transaction([storeName], 'readonly');
	  const store = transaction.objectStore(storeName);

	  return new Promise((resolve, reject) => {
		const request = store.get(key);

		request.onsuccess = () => {
		    const result = request.result;
		    if (result) {
			  resolve(result.value);
		    } else {
			  
			  resolve(defaultValue);
		    }
		};

		request.onerror = () => reject(request.error);
	  });
    } catch (error) {
	  
	  return defaultValue;
    }
}
async function getSetting(key) {
    await updateMemoryData();
    try {
        if (!memory["System/"]) {
            memory["System/"] = {};
        }
        if (!memory["System/"]["preferences.json"]) {
            await createFile("System/", "preferences.json", "json", "{}");
        }
        let preferencesContent = atob(memory["System/"]["preferences.json"]["content"]);
        let preferences = JSON.parse(preferencesContent);
        return preferences[key];
    } catch (error) {
        console.log("Error getting settings", error);
    }
}

async function setSetting(key, value) {
    await updateMemoryData();
    try {
        if (!memory["System/"]) {
            memory["System/"] = {};
        }
        if (!memory["System/"]["preferences.json"]) {
            await createFile("System/", "preferences.json", "json", "{}");
        }
        let preferencesContent = atob(memory["System/"]["preferences.json"]["content"]);
        let preferences = JSON.parse(preferencesContent);
        preferences[key] = value;
        memory["System/"]["preferences.json"]["content"] = btoa(JSON.stringify(preferences));
        await setdb(memory);
    } catch (error) {
        console.log("Error setting settings", error);
    }
}
async function resetSettings(value) {
    await updateMemoryData();
    try {
        if (!memory["System/"]["preferences.json"]) {
            memory["System/"]["preferences.json"] = { content: '{}', id: genUID() };
        }
        let preferences = JSON.parse(memory["System/"]["preferences.json"]["content"]);
        preferences = value;
        memory["System/"]["preferences.json"]["content"] = JSON.stringify(preferences);
        await setdb(memory);
    } catch (error) {
        console.log("Error resetting settings");
    }
}

async function remSetting(key) {
    await updateMemoryData();
    try {
        if (memory["System/"] && memory["System/"]["preferences.json"]) {
            let preferences = JSON.parse(memory["System/"]["preferences.json"]["content"]);
            if (preferences[key]) {
                delete preferences[key];
                memory["System/"]["preferences.json"]["content"] = JSON.stringify(preferences);
                await setdb(memory);
            }
        }
    } catch (error) {
        console.log("error removing settings");
    }
}

async function changePassword(oldPassword, newPassword) {
    
    lethalpasswordtimes = true;
    
    const isOldPasswordCorrect = await checkPassword(oldPassword);
    
    if (!isOldPasswordCorrect) {
	  
	  lethalpasswordtimes = false;
	  return false;
    }

    
    const oldKey = await getKey(oldPassword);
    const newKey = await getKey(newPassword);

    
    const db = await openDB(databaseName, 1);
    const store = db.transaction('dataStore', 'readonly').objectStore('dataStore');

    try {
	  
	  const record = await new Promise((resolve, reject) => {
		const getRequest = store.get(CurrentUsername);
		getRequest.onsuccess = () => resolve(getRequest.result);
		getRequest.onerror = () => reject(getRequest.error);
	  });

	  if (!record || !record.value) {
		
		lethalpasswordtimes = false;
		return false;
	  }

	  
	  const decryptedValue = await decryptData(oldKey, record.value);
	  console.log(`Decrypted value: ${JSON.stringify(decryptedValue)}`);

	  
	  password = newPassword;

	  await setdb(decryptedValue);

    } catch (error) {
	  
	  lethalpasswordtimes = false;
	  return false;
    }

    
    await saveMagicStringInLocalStorage(newPassword);

    
    lethalpasswordtimes = false;
    return true;
}



function erdbsfull() {
    localStorage.removeItem('todo');
    localStorage.removeItem('magicString');
    localStorage.removeItem('updver');
    localStorage.removeItem('qsets');

    let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
    let dbName = 'trojencat';

    try {
	  let deleteRequest = indexedDB.deleteDatabase(dbName);

	  deleteRequest.onsuccess = function (event) {
		
		location.reload();
	  };

	  deleteRequest.onerror = function (event) {
		
	  };

	  deleteRequest.onblocked = function () {
		
	  };
    } catch (error) {
	  
    }
}