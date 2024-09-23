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
    return new Promise((resolve, reject) => {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'decrypt',
                key,
                encryptedData
            });

            navigator.serviceWorker.addEventListener('message', function handler(event) {
                if (event.data.type === 'decrypted') {
                    resolve(event.data.result);
                    navigator.serviceWorker.removeEventListener('message', handler);
                } else if (event.data.type === 'error') {
                    reject(event.data.error);
                    navigator.serviceWorker.removeEventListener('message', handler);
                }
            });
        } else {
            reject(new Error('Service Worker not available.'));
        }
    });
}

let batchQueue = [];
let batchTimeout = null;
const batchInterval = 500; // Time interval for batching in milliseconds

async function flushBatch() {
    const databaseName = 'trojencat';
    const key = 'dataStore';

    try {
        const db = await openDB(databaseName, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(key)) {
                    db.createObjectStore(key, { keyPath: 'CurrentUsername' });
                }
            }
        });
        
		const start = performance.now();
        const processedBatch = await Promise.all(batchQueue.map(async ({ value }) => {
            try {
                const cryptoKey = await getKey(password);
                const compressedData = compressString(JSON.stringify(value));
                const encryptedValue = await encryptData(cryptoKey, compressedData);
                const end = performance.now();
                console.log(`Saving took ${(end - start).toFixed(2)}ms`);
                return { encryptedValue }; 
            } catch (error) {
                console.error("Error processing batch item:", error);
                return null; 
            }
        }));
        

        const transaction = db.transaction(key, 'readwrite');
        const store = transaction.objectStore(key);

        processedBatch.forEach((batchItem, index) => {
            if (batchItem && batchItem.encryptedValue) {
                store.put({ key: CurrentUsername, value: batchItem.encryptedValue });
                batchQueue[index].resolve();
            } else {
                batchQueue[index].reject(new Error("Failed to process batch item"));
            }
        });

        await transaction.complete;

        console.log(`Batch of ${processedBatch.length} saved to ${CurrentUsername}`);
        batchQueue = [];
    } catch (error) {
        console.error("Error in flushBatch function:", error);
    } finally {
        batchTimeout = null;
    }
}
const maxBatchSize = 10;

function setdb(value) {
    return new Promise((resolve, reject) => {
        batchQueue.push({ value, resolve, reject });

        if (batchQueue.length >= maxBatchSize) {
            if (batchTimeout) {
                clearTimeout(batchTimeout);
            }

            batchTimeout = setTimeout(async () => {
                try {
                    await flushBatch();
                } catch (error) {
                    reject(error);
                }
            }, batchInterval);
        } else if (!batchTimeout) {
            batchTimeout = setTimeout(async () => {
                try {
                    await flushBatch();
                } catch (error) {
                    reject(error);
                }
            }, batchInterval);
        }
    });
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
				memory = parseEscapedJsonString(decompressString(decryptedValue));
				resolve(memory);
			  } catch (error) {
				console.error("Decryption error:", error);
				reject(3);
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

    // Helper function to convert Uint8Array to Base64
    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    // Helper function to convert Base64 to Uint8Array
    function base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    // Synchronous function to compress data
    function compressString(input) {
        try {
            const inputUint8Array = new TextEncoder().encode(JSON.stringify(input));

            // Compress synchronously using fflate (gzipSync)
            const compressed = fflate.gzipSync(inputUint8Array);

            // Convert compressed data to base64
            return arrayBufferToBase64(compressed);
        } catch (error) {
            console.error("Compression Error:", error);
            throw error;
        }
    }

    // Synchronous function to decompress data
    function decompressString(compressedBase64) {
        try {
            const compressedData = base64ToArrayBuffer(compressedBase64);

            // Decompress synchronously using fflate (gunzipSync)
            const decompressed = fflate.gunzipSync(compressedData);

            // Decode decompressed data to JSON object
            return JSON.parse(new TextDecoder().decode(decompressed));
        } catch (error) {
            console.error("Decompression Error:", error);
            throw error;
        }
    }
async function removeInvalidMagicStrings() {
    const validUsernames = new Set(await getAllUsers());
    const magicStrings = JSON.parse(localStorage.getItem('magicStrings'));

    if (!magicStrings) return;

    for (const username in magicStrings) {
        if (!validUsernames.has(username)) {
            delete magicStrings[username];
        }
    }

    localStorage.setItem('magicStrings', JSON.stringify(magicStrings));
}


async function checkPassword(password) {
    const magicStrings = JSON.parse(localStorage.getItem('magicStrings')) || {};
    const encryptedMagicString = magicStrings[CurrentUsername];

    if (!encryptedMagicString) {
        console.error(`Magic string not found for user: ${CurrentUsername}`);
        return false;
    }

    const cryptoKey = await getKey(password);
    try {
        const decryptedMagicString = await decryptData(cryptoKey, encryptedMagicString);
        if (decryptedMagicString === "magicString") {
            return true;
        } else {
            return false;
        }
    } catch (error) {
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
let MemoryTimeCache = null;
let isFetchingMemory = false;
let cachedData = null;

function getTime() {
    return Date.now();
}

async function fetchmmData() {
    try {
        const data = await getdb();
        MemoryTimeCache = getTime();
        cachedData = data;
        return data ?? null;
    } catch (error) {
        console.error("Memory data unreadable", error);
        return 3;
    } finally {
        isFetchingMemory = false;
    }
}

async function updateMemoryData() {
    if (MemoryTimeCache === null || (getTime() - MemoryTimeCache) >= 5000) {
        if (!isFetchingMemory) {
            isFetchingMemory = true;
            return fetchmmData();
        } else {
            while (isFetchingMemory) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
    }
    memory = cachedData;
    return cachedData;
}

function parseEscapedJsonString(escapedString) {
    if (escapedString.startsWith('"') && escapedString.endsWith('"')) {
        escapedString = escapedString.slice(1, -1);
    }

    try {
        return JSON.parse(escapedString);
    } catch {
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
async function ensurePreferencesFileExists() {
    await updateMemoryData();
    try {
        if (!memory["System/"]) {
            memory["System/"] = {};
        }
        if (!memory["System/"]["preferences.json"]) {
    const defaultPreferences = {
        "defFileLayout": "List",
        "wsnapping": true,
        "smartsearch": true,
        "CamImgFormat": "WEBP",
        "defSearchEngine": "Bing"
    };

    // Encode the default preferences as Base64 with MIME type
    const defaultContent = btoa(JSON.stringify(defaultPreferences));
    const dataUri = `data:application/json;base64,${defaultContent}`;

    await createFile("System/", "preferences.json", false, dataUri);
}
    } catch (err) {
        console.log("Error ensuring preferences file exists", err);
    }
}

let settingsCache = {};
const settingscacheDuration = 500;

async function getSetting(key) {
    try {
        if (!memory) return;

        const cached = settingsCache[key];
        if (cached && (Date.now() - cached.t < settingscacheDuration)) return cached.v;

        await ensurePreferencesFileExists();
        const content = memory["System/"]["preferences.json"]["content"];
        if (!content) return;

        const preferences = JSON.parse(atob(content.split(",")[1]));
        settingsCache[key] = { v: preferences[key], t: Date.now() };
        return preferences[key];
    } catch (error) {
        console.log("Error getting settings", error);
    }
}

async function setSetting(key, value) {
    try {
        if (!memory) return null;

        await ensurePreferencesFileExists();
        let content = memory["System/"]["preferences.json"]["content"];
        
        let preferences = {};

        if (content) {
            const base64Content = content.split(",")[1]; // Extract Base64 content from the MIME type prefix
            preferences = JSON.parse(atob(base64Content));
        }

        preferences[key] = value;

        // Prepend MIME type prefix when saving
        const newContent = `data:application/json;base64,${btoa(JSON.stringify(preferences))}`;
        memory["System/"]["preferences.json"]["content"] = newContent;
        
        await setdb(memory);
    } catch (error) {
        console.log("Error setting settings", error);
    }
}

async function resetSettings(value) {
    try {
        if (!memory) {return}
        await ensurePreferencesFileExists();
        let preferences = value;
        memory["System/"]["preferences.json"]["content"] = btoa(JSON.stringify(preferences));
        await setdb(memory);
    } catch (error) {
        console.log("Error resetting settings", error);
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

async function saveMagicStringInLocalStorage(password) {
    const cryptoKey = await getKey(password);
    const encryptedMagicString = await encryptData(cryptoKey, "magicString");

    const magicStrings = JSON.parse(localStorage.getItem('magicStrings')) || {};
    magicStrings[CurrentUsername] = encryptedMagicString;

    localStorage.setItem('magicStrings', JSON.stringify(magicStrings));
}

async function removeInvalidMagicStrings() {
    const validUsernames = new Set(await getallusers());
    const magicStrings = JSON.parse(localStorage.getItem('magicStrings'));

    if (!magicStrings) return;

    for (const username in magicStrings) {
        if (!validUsernames.has(username)) {
            delete magicStrings[username];
        }
    }

    localStorage.setItem('magicStrings', JSON.stringify(magicStrings));
}


async function changePassword(oldPassword, newPassword) {
    lethalpasswordtimes = true;

    if (!await checkPassword(oldPassword)) {
        lethalpasswordtimes = false;
        return false;
    }

    try {
        memory = await getdb();
        password = newPassword;
        await setdb(memory);

        await saveMagicStringInLocalStorage(newPassword);

    } catch (error) {
        lethalpasswordtimes = false;
        return false;
    }

    lethalpasswordtimes = false;
    return true;
}

async function erdbsfull() {
    if (await justConfirm("Are you really sure?", "Removing all the users data seems a bit overkill? Click cancel to remove your account instead.")) {
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
    };
}

async function removeUser(username = CurrentUsername) {
    const key = 'dataStore';

    try {
        const db = await openDB(databaseName, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(key)) {
                    db.createObjectStore(key, { keyPath: 'CurrentUsername' });
                }
            }
        });

        const transaction = db.transaction(key, 'readwrite');
        const store = transaction.objectStore(key);

        const existingUser = await store.get(username);
        
        const magicStrings = JSON.parse(localStorage.getItem('magicStrings')) || {};
        delete magicStrings[CurrentUsername];
        localStorage.setItem('magicStrings', JSON.stringify(magicStrings));
        if (existingUser) {
            await store.delete(username);
            console.log(`User ${username} removed successfully.`);
        } else {
            console.warn(`User ${username} does not exist.`);
        }

        await transaction.complete;
        logoutofnova()
    } catch (error) {
        console.error("Error in removeUser function:", error);
    }
}

function removeSWs() {
	if ('serviceWorker' in navigator) {

        // Get all service worker registrations
        navigator.serviceWorker.getRegistrations()
          .then(registrations => {
            // Unregister all service workers and delete all caches
            const promises = registrations.map(registration => 
              caches.keys()
                .then(cacheNames => Promise.all(cacheNames.map(cacheName => caches.delete(cacheName))))
                .then(() => registration.unregister())  // Unregister each service worker
            );
            return Promise.all(promises);  // Wait for all to complete
          })
          .then(() => {
            console.log('All service workers and caches have been removed.');
          })
          .catch(error => {
            console.error('Error:', error);
          });
      } else {
        console.log('Service workers not supported.');
      }
  }
