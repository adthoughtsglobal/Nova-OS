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

            if (!db.objectStoreNames.contains(CurrentUsername)) {
                db.createObjectStore(CurrentUsername, { keyPath: 'key' });
                console.log(`Object store '${CurrentUsername}' created.`);
                await saveMagicStringInLocalStorage(password);
            }
        };

        request.onsuccess = async (event) => {
            const db = event.target.result;

            if (db.version > 1) {
                const dataToPreserve = await readAllData(db, CurrentUsername);
                db.close();

                const deleteRequest = indexedDB.deleteDatabase(databaseName);
                deleteRequest.onsuccess = () => {
                    const resetRequest = indexedDB.open(databaseName, 1);

                    resetRequest.onupgradeneeded = (resetEvent) => {
                        const newDb = resetEvent.target.result;
                        const objectStore = newDb.createObjectStore(CurrentUsername, { keyPath: 'key' });
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

async function setdb(databaseName, key, value) {
    try {
        const db = await openDB(databaseName, 1);
        const cryptoKey = await getKey(password);
        const encryptedValue = await encryptData(cryptoKey, JSON.stringify(value));

        const transaction = db.transaction([CurrentUsername], 'readwrite');
        const store = transaction.objectStore(CurrentUsername);
        const putRequest = store.put({ key, value: encryptedValue });

        await new Promise((resolve, reject) => {
            putRequest.onsuccess = resolve;
            putRequest.onerror = () => reject(putRequest.error);
        });

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

async function getdb(databaseName, key) {
    try {
        const db = await openDB(databaseName, 1);
        const transaction = db.transaction([CurrentUsername], 'readonly');
        const store = transaction.objectStore(CurrentUsername);
        const request = store.get(key);

        return new Promise((resolve, reject) => {
            request.onsuccess = async () => {
                if (request.result) {
                    try {
                        const cryptoKey = await getKey(password);
                        console.log(request.result.value);
                        const decryptedValue = await decryptData(cryptoKey, request.result.value);
                        const memory = JSON.parse(decryptedValue);
                        resolve(memory); // Directly resolve as a plain object
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
            await getdb('trojencat', 'rom', "").then(result => {
                MemoryTimeCache = getTime();
                isFetchingMemory = false;
            }).catch(err => {
                console.error("Memory data unreadable");
                isFetchingMemory = false;
            });
        }
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
                    console.log(`Not found: '${key}'`);
                    resolve(defaultValue);
                }
            };

            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("Failed:", error);
        return defaultValue;
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
        console.log("Error getting settings");
    }
}

async function setSetting(key, value) {
    await updateMemoryData();
    try {
        if ("preferences.json" in (memory?.["System"]?.["/"] || {})) {
           await createFile("System/", "preferences.json", false, "{}")
        }
        let preferences = JSON.parse(memory["System/"]["preferences.json"]["content"]);
        preferences[key] = value;
        memory["System/"]["preferences.json"]["content"] = JSON.stringify(preferences);
        await setdb('trojencat', 'rom', memory);
    } catch (error) {
        console.log("error setting settings");
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
                await setdb('trojencat', 'rom', memory);
            }
        }
    } catch (error) {
        console.log("error removing settings");
    }
}

async function changePassword(oldPassword, newPassword) {
    console.log("Starting password change process...");
    lethalpasswordtimes = true;

    console.log("Checking old password...");
    const isOldPasswordCorrect = await checkPassword(oldPassword);
    console.log(`Old password check result: ${isOldPasswordCorrect}`);
    if (!isOldPasswordCorrect) {
        console.error("Old password is incorrect");
        lethalpasswordtimes = false;
        return false;
    }

    console.log("Old password is correct. Retrieving keys...");
    const oldKey = await getKey(oldPassword);
    const newKey = await getKey(newPassword);

    console.log("Opening database...");
    const db = await openDB(databaseName, 1);
    const store = db.transaction([CurrentUsername], 'readonly').objectStore(CurrentUsername);

    try {
        console.log("Retrieving record from the database...");
        const record = await new Promise((resolve, reject) => {
            const getRequest = store.get('rom');
            getRequest.onsuccess = () => resolve(getRequest.result);
            getRequest.onerror = () => reject(getRequest.error);
        });

        if (!record || !record.value) {
            console.error("Failed to retrieve data");
            lethalpasswordtimes = false;
            return false;
        }

        console.log("Decrypting data with old key...");
        const decryptedValue = await decryptData(oldKey, record.value);
        console.log(`Decrypted value: ${JSON.stringify(decryptedValue)}`);

        console.log("Encrypting data with new key...");
        password = newPassword;

        await setdb(databaseName, 'rom', decryptedValue);

    } catch (error) {
        console.error("Failed to re-encrypt data", error);
        lethalpasswordtimes = false;
        return false;
    }

    console.log("Saving new password to local storage...");
    await saveMagicStringInLocalStorage(newPassword);
    
    console.log("Password changed successfully.");
    lethalpasswordtimes = false;
    return true;
}


function erdbsfull() {
    localStorage.removeItem('todo');
    localStorage.removeItem('magicString');
    localStorage.removeItem('updver');

    let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
    let dbName = 'trojencat';
    let storeName = CurrentUsername;
    let keyToRemove = 'rom';

    try {
        let request = indexedDB.open(dbName);

        request.onsuccess = function (event) {
            let db = event.target.result;

            if (db.objectStoreNames.contains(storeName)) {
                let transaction = db.transaction(storeName, 'readwrite');
                let objectStore = transaction.objectStore(storeName);

                let deleteRequest = objectStore.delete(keyToRemove);

                deleteRequest.onsuccess = function (event) {
                    console.log("Key 'rom' removed.");
                    localStorage.removeItem("qsets");
                    location.reload();
                };

                deleteRequest.onerror = function (event) {
                    console.error("Error removing rom:", event.target.errorCode);
                };
            } else {
                console.warn(`Store not found: '${storeName}'`);
                localStorage.removeItem("qsets");
                location.reload();
            }
        };

        request.onerror = function (event) {
            console.error("Error opening database:", event.target.errorCode);
        };
    } catch (error) {
        console.log(error);
    }
}