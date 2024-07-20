var databaseName = 'trojencat';
var CurrentUsername = 'user1';
var password = "uwu";
var magicString = "adthoughtsglobal";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Function to open or create an IndexedDB database
async function openDB(databaseName, version) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, version);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(CurrentUsername)) {
                db.createObjectStore(CurrentUsername, { keyPath: 'key' }); // keyPath for unique key
                console.log(`Object store '${CurrentUsername}' created.`);
            }
        };

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
        encoder.encode(magicString + data)
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

        const decryptedText = decoder.decode(decrypted);
        if (decryptedText.startsWith(magicString)) {
            return decryptedText.slice(magicString.length);
        } else {
            throw new Error("Incorrect password or corrupted data");
        }
    } catch (error) {
        console.error("Incorrect password or corrupted data");
        throw error;
    }
}

async function setdb(databaseName, key, value) {
    try {
        // Open the database and ensure the object store exists
        const db = await openDB(databaseName, 1);

        // Generate encryption key
        const cryptoKey = await getKey(password);

        // Encrypt data
        const encryptedValue = await encryptData(cryptoKey, JSON.stringify(value));

		// Create a new transaction
        const transaction = db.transaction([CurrentUsername], 'readwrite');
        const store = transaction.objectStore(CurrentUsername);

        // Create a promise for the put request
        const putRequest = store.put({ key, value: encryptedValue });

        // Handle success and error for the put request
        await new Promise((resolve, reject) => {
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(putRequest.error);
        });

        // Ensure the transaction completes
        await new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error);
        });

        console.log(`Data for key '${key}' saved successfully.`);
    } catch (error) {
        console.error("Error in setdb function:", error);
    }
}

async function getdb(databaseName, key) {
    try {
        // Open database and ensure object store
        const db = await openDB(databaseName, 1);
        
        // Create a new transaction
        const transaction = db.transaction([CurrentUsername], 'readonly');
        const store = transaction.objectStore(CurrentUsername);

        // Retrieve the data
        const request = store.get(key);

        return new Promise((resolve, reject) => {
            request.onsuccess = async () => {
                const result = request.result;
                if (result) {
                    try {
                        const cryptoKey = await getKey(password);
                        const decryptedValue = await decryptData(cryptoKey, result.value);
                        resolve(JSON.parse(decryptedValue));
                    } catch (error) {
                        console.error("Decryption error:", error);
                        reject(error);
                    }
                } else {
                    resolve(null); // Key not found
                }
            };

            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("Error in getdb function:", error);
    }
}
// settings store functions

var MemoryTimeCache = null;

function getTime() {
    return Date.now();
}

async function updateMemoryData() {
	let isittime = (Date.now() - MemoryTimeCache) >= 5000;
	if (MemoryTimeCache === null || isittime) {
		console.log("Catching Memory", (Date.now() - MemoryTimeCache))
		getdb('trojencat', 'rom').then(function (result) {
			memory = result;
			MemoryTimeCache = Date.now();
		});
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
                    console.log(`Key '${key}' not found. Returning default value.`);
                    resolve(defaultValue); // Return default value if key is not found
                }
            };

            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("Failed to get data:", error);
        return defaultValue; // Return default value on error
    }
}

async function getSetting(key) {
    await updateMemoryData()
    try {
        if (memory["System/"]["preferences.json"]) {
            let preferences = JSON.parse(memory["System/"]["preferences.json"]["content"]);
            return preferences[key];
        } else {
            return undefined;
        }
    } catch (error) {
        console.log(error);
    }
}

async function setSetting(key, value) {
    await updateMemoryData();
    try {
        if (!memory["System/"]["preferences.json"]) {
           await createFile("System/", "preferences.json", false, "{}")
        }
        let preferences = JSON.parse(memory["System/"]["preferences.json"]["content"]);
        preferences[key] = value;
        memory["System/"]["preferences.json"]["content"] = JSON.stringify(preferences);
        await setdb('trojencat', 'rom', memory);
    } catch (error) {
        console.log(error);
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
        await setdb('trojencat', 'rom', memory);
    } catch (error) {
        console.log(error);
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
                await setdb('trojencat', 'rom', memory);
            }
        }
    } catch (error) {
        console.log(error);
    }
}

async function checkPassword(password) {
    try {
        const db = await openDB(databaseName, 1);
        const transaction = db.transaction([CurrentUsername], 'readonly');
        const store = transaction.objectStore(CurrentUsername);
        const request = store.get('rom');

        const result = await new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        if (result) {
            console.log("Data found for key 'rom':", result);
            const cryptoKey = await getKey(password);

            try {
                const decryptedValue = await decryptData(cryptoKey, result.value);
                console.log("Decrypted value:", decryptedValue);
                
                if (decryptedValue) { // Assuming the presence of decryptedValue means correct password
                    return true;
                }
            } catch (decryptionError) {
                console.error("Decryption error:", decryptionError);
                return false; // Decryption error indicates incorrect password
            }
        } else {
            console.log("Data not found for key 'rom'.");
            return false;
        }
    } catch (error) {
        console.error("Error in checkPassword function:", error);
        return false;
    }
}