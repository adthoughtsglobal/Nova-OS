var databaseName = 'trojencat';
var CurrentUsername = 'Admin';
var password = "nova";
const encoder = new TextEncoder();
const decoder = new TextDecoder();
var lethalpasswordtimes = true;

const eventBusBlob = new Blob([`
    const eventBus = new EventTarget();
    self.addEventListener('message', (e) => {
        const { type, event: evt, key, id } = e.data;
        eventBus.dispatchEvent(new CustomEvent(type, { detail: { event: evt, key, id } }));
    });
    
    self.deliver = (message) => self.postMessage(message);
    self.listen = (type, handler) => {
        eventBus.addEventListener(type, (e) => handler(e.detail));
    };
`], { type: 'application/javascript' });

const eventBusURL = URL.createObjectURL(eventBusBlob);
const eventBusWorkerE = new Worker(eventBusURL);

const eventBusWorker = {
    deliver: (message) => eventBusWorkerE.postMessage(message),
    listen: (type, handler) => {
        eventBusWorkerE.addEventListener('message', (event) => {
            if (event.data.type === type) {
                handler(event.data.detail);
            }
        });
    }
};

eventBusWorker.listen("memory", (event) => {
    console.log("Received memory event:", event);
});

async function openDB(databaseName, version) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, version);

        request.onupgradeneeded = async (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains("dataStore")) {
                db.createObjectStore("dataStore", { keyPath: 'key' });
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

let decryptWorkerRegistered = false;

async function decryptData(key, encryptedData) {
    if ('serviceWorker' in navigator && !navigator.serviceWorker.controller && !decryptWorkerRegistered) {
        await registerDecryptWorker();
    }

    return new Promise(async (resolve, reject) => {
        if (navigator.serviceWorker.controller) {
            const handler = (event) => {
                if (event.data.type === 'decrypted') resolve(event.data.result);
                else if (event.data.type === 'error') reject(event.data.error);
                navigator.serviceWorker.removeEventListener('message', handler);
            };

            navigator.serviceWorker.addEventListener('message', handler);
            navigator.serviceWorker.controller.postMessage({
                type: 'decrypt',
                key,
                encryptedData
            });
        } else {
            try {
                const iv = new Uint8Array(encryptedData.iv);
                const data = new Uint8Array(encryptedData.data);
                const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
                resolve(new TextDecoder().decode(decrypted));
            } catch (error) {
                reject('Incorrect password or corrupted data');
            }
        }
    });
}

async function registerDecryptWorker() {
    if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('novaCrypt.js')
            .then(() => decryptWorkerRegistered = true)
            .catch(err => console.error('Service Worker registration failed:', err));
    }
}

let dbCache = null;
let cryptoKeyCache = null;
const key = 'dataStore';

async function flushDB(value) {
    if (!dbCache) {
        dbCache = await openDB(databaseName, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(key)) {
                    db.createObjectStore(key, { keyPath: 'CurrentUsername' });
                }
            }
        });
    }

    if (!cryptoKeyCache) {
        cryptoKeyCache = await getKey(password);
    }

    const encryptedContentPool = {};
    for (const id in value.contentpool) {
        const compressedContent = compressString(value.contentpool[id]);
        encryptedContentPool[id] = await encryptData(cryptoKeyCache, compressedContent);
    }

    const memoryValue = {
        key: CurrentUsername || 'Admin',
        memory: value.memory,
        contentpool: encryptedContentPool
    };

    const transaction = dbCache.transaction(key, 'readwrite');
    const store = transaction.objectStore(key);

    await store.put(memoryValue);

    return new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
    });
}

function setdb() {
    const value = { memory: { ...memory }, contentpool: { ...contentpool } };

    return flushDB(value)
        .catch(error => console.error("Error during setdb execution:", error));
}
async function getdb() {
    if (!dbCache) {
        dbCache = await openDB(databaseName, 1);
    }

    if (!cryptoKeyCache) {
        cryptoKeyCache = await getKey(password);
    }

    try {
        const transaction = dbCache.transaction('dataStore', 'readonly');
        const store = transaction.objectStore('dataStore');
        const request = store.get(CurrentUsername);

        return new Promise((resolve, reject) => {
            request.onsuccess = async () => {
                const result = request.result;

                if (result) {
                    try {
                        const decryptedContentPool = {};

                        memory = result.memory;
                        for (const id in result.contentpool) {
                            const decryptedContent = await decryptData(cryptoKeyCache, result.contentpool[id]);
                            decryptedContentPool[id] = decompressString(decryptedContent);
                        }

                        contentpool = decryptedContentPool;
                        resolve(memory);

                    } catch (error) {
                        console.error("Decryption error:", error);
                        if (!lethalpasswordtimes) crashScreen(error.message);
                        reject(3);
                    }
                } else {
                    resolve(null);
                }
            };

            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        gid("versionswitcher").showModal();
        console.error("Error in getdb function:", error);
        throw error;
    }
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}


function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}


function compressString(input) {
    try {
        const inputUint8Array = new TextEncoder().encode(JSON.stringify(input));


        const compressed = fflate.gzipSync(inputUint8Array);


        return arrayBufferToBase64(compressed);
    } catch (error) {
        console.error("Compression Error:", error);
        throw error;
    }
}


function decompressString(compressedBase64) {
    try {
        const compressedData = base64ToArrayBuffer(compressedBase64);


        const decompressed = fflate.gunzipSync(compressedData);


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
    if (MemoryTimeCache === null || (getTime() - MemoryTimeCache) >= 1000) {
        if (!isFetchingMemory) {
            isFetchingMemory = true;
            return fetchmmData();
        } else {
            while (isFetchingMemory) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
    }
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
const defaultPreferences = {
    "defFileLayout": "List",
    "wsnapping": true,
    "smartsearch": true,
    "CamImgFormat": "WEBP",
    "defSearchEngine": "Bing"
};

async function ensurePreferencesFileExists() {
    await updateMemoryData();
    try {
        memory.root["System/"] = memory.root["System/"] || {};
        if (!memory.root["System/"]["preferences.json"]) {
            
            const dataUri = `data:application/json;base64,${btoa(JSON.stringify(defaultPreferences))}`;
            await createFile("System/", "preferences.json", false, dataUri);
        }
    } catch (err) {
        console.log("Error ensuring preferences file exists", err);
    }
}

let settingsCache = {};
const settingscacheDuration = 10;

async function getSetting(key) {
    try {
        if (!memory) return;

        const cached = settingsCache[key];
        if (cached && (Date.now() - cached.t < settingscacheDuration)) return cached.v;

        await ensurePreferencesFileExists();
        const content = memory.root["System/"]["preferences.json"];
        if (!content) return;

        const base64Content = contentpool[content.id];
        const preferences = JSON.parse(decodeBase64Content(base64Content));
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
        const content = memory.root["System/"]["preferences.json"];
        let preferences = {};

        if (content) {
            const existingContent = contentpool[content.id];
            const decodedContent = decodeBase64Content(existingContent);
            preferences = JSON.parse(decodedContent);
        }

        preferences[key] = value;

        const newContent = `data:application/json;base64,${btoa(JSON.stringify(preferences))}`;
        contentpool[content.id] = newContent;

        await setdb("set setting " + key);
        eventBusWorker.deliver({
			"type":"settings",
			"event":"set",
            "key":key
		});
    } catch (error) {
        console.log("Error setting settings", error, key);
    }
}

async function resetSettings() {
    try {
        if (!memory) return;

        await ensurePreferencesFileExists();
        const content = memory.root["System/"]["preferences.json"];
        
        const newContent = `data:application/json;base64,${btoa(JSON.stringify(defaultPreferences))}`;
        contentpool[content.id] = newContent;
        
        await setdb("reset settings");
        eventBusWorker.deliver({
			"type":"settings",
			"event":"reset"
		});
    } catch (error) {
        console.log("Error resetting settings", error);
    }
}

async function remSetting(key) {
    await updateMemoryData();
    try {
        if (memory.root["System/"] && memory.root["System/"]["preferences.json"]) {
            const content = memory.root["System/"]["preferences.json"];
            let preferences = JSON.parse(decodeBase64Content(contentpool[content.id]));
            if (preferences[key]) {
                delete preferences[key];
                
                const newContent = `data:application/json;base64,${btoa(JSON.stringify(preferences))}`;
                contentpool[content.id] = newContent;
                
                await setdb("remove setting");
                eventBusWorker.deliver({
                    "type":"settings",
                    "event":"remove",
                    "key":key
                });
            }
        }
    } catch (error) {
        console.log("Error removing settings", error);
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
        
        dbCache = null;
        cryptoKeyCache = null;
        await setdb("change password");
        eventBusWorker.deliver({
			"type":"memory",
			"event":"update",
			"id":"passwordChange"
		});

        await saveMagicStringInLocalStorage(newPassword);

    } catch (error) {
        lethalpasswordtimes = false;
        return false;
    }

    lethalpasswordtimes = false;
    return true;
}

async function erdbsfull() {
    if (await justConfirm("Are you really sure?", "Removing all the users data includes your settings, files, and other data. Click cancel keep it.")) {
        localStorage.removeItem('todo');
        localStorage.removeItem('magicString');
        localStorage.removeItem('updver');
        localStorage.removeItem('qsets');

        let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
        let dbName = 'trojencat';

        let deleteRequest = indexedDB.deleteDatabase(dbName);
deleteRequest.onsuccess = () => location.reload();
deleteRequest.onerror = deleteRequest.onblocked = () => location.reload();

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


        navigator.serviceWorker.getRegistrations()
            .then(registrations => {

                const promises = registrations.map(registration =>
                    caches.keys()
                        .then(cacheNames => Promise.all(cacheNames.map(cacheName => caches.delete(cacheName))))
                        .then(() => registration.unregister())
                );
                return Promise.all(promises);
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

// memory management
async function getFileNamesByFolder(folderPath) {
    folderPath = folderPath.endsWith('/') ? folderPath : folderPath + '/';
    try {
        const root = memory["root"];
        const folderNames = folderPath.split('/').filter(Boolean);
        let currentFolder = root;

        for (const name of folderNames) {
            if (!currentFolder[name + '/']) {
                return [];
            }
            currentFolder = currentFolder[name + '/'];
        }

        return Object.entries(currentFolder).map(([fileName, file]) =>
            fileName.endsWith('/') ? { name: fileName } : { id: file.id, name: fileName }
        );
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}
async function getFileByPath(path) {
    await updateMemoryData();
    const segments = path.split('/').filter(segment => segment);
    let current = memory.root;

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const isLastSegment = i === segments.length - 1;

        if (current[segment + '/'] && !isLastSegment) {
            current = current[segment + '/'];
        } else if (current[segment] && isLastSegment) {
            return current[segment];
        } else {
            return null;
        }
    }

    return null;
}

async function getFileById(id) {
    if (!id) return undefined;
    await updateMemoryData();

    return findFileDetails(id, memory.root);
}

function findFileDetails(id, folder, currentPath = '') {
    for (let key in folder) {
        const item = folder[key];
        if (item && typeof item === 'object') {
            if (item.id === id) {
                const content = contentpool[id];
                return {
                    fileName: key,
                    id: item.id,
                    content: content,
                    metadata: item.metadata,
                    path: currentPath
                };
            } else if (key.endsWith('/')) {
                const result = findFileDetails(id, item, currentPath + key);
                if (result) return result;
            }
        }
    }
    return null;
}

async function getFileNameByID(id) {
    if (!id) return undefined;
    await updateMemoryData();

    function findFileName(id, folder, currentPath = '') {
        for (let key in folder) {
            const item = folder[key];
            if (item && typeof item === 'object') {
                if (item.id === id) {
                    return key;
                } else if (key.endsWith('/')) {
                    const result = findFileName(id, item, currentPath + key);
                    if (result) return result;
                }
            }
        }
        return null;
    }

    return findFileName(id, memory.root);
}

async function getFolderNames() {
    try {
        await updateMemoryData();
        const folderNames = [];

        for (const key in memory.root) {
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

async function moveFileToFolder(flid, dest) {
    console.log("Moving file: " + flid + " to: " + dest);

    let fileToMove = await getFileById(flid);
    if (!fileToMove) return; // Ensure the file exists

    await createFile(dest, fileToMove.fileName, fileToMove.type, fileToMove.content, fileToMove.metadata);
    await remfile(flid);
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
                    delete contentpool[ID]; // Remove content from contentpool
                    console.log("File eliminated.");
                    return true;
                }
            }
            return false;
        }

        let fileRemoved = removeFileFromFolder(memory.root);

        if (!fileRemoved) {
            console.error(`File with ID "${ID}" not found.`);
        } else {
            await setdb("remove file");
            eventBusWorker.deliver({
                "type":"memory",
                "event":"update",
                "id":"removeFile"
            });
        }
    } catch (error) {
        console.error("Error fetching or updating data:", error);
    }
}

async function remfolder(folderPath) {
    try {
        await updateMemoryData();

        let parts = folderPath.split('/').filter(part => part);
        let current = memory.root;
        let parent = null;
        let key = null;

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
        if (parent && key) {
            delete parent[key];
            console.log(`Folder Eliminated: "${folderPath}"`);
        } else {
            console.error(`Unable to delete folder "${folderPath}".`);
            return;
        }

        await setdb("remove folder");
        eventBusWorker.deliver({
			"type":"memory",
			"event":"update",
			"id":"removeFolder"
		});
    } catch (error) {
        console.error("Error removing folder:", error);
    }
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
        let targetFolder = memory.root;
        let folderNames = folderName.split('/');
        for (let name of folderNames) {
            if (name) {
                targetFolder = targetFolder[name + '/'];
                if (!targetFolder) {
                    throw new Error(`Folder "${name}" not found.`);
                }
            }
        }

        let fileLocation = findFile(targetFolder, fileId);

        if (fileLocation) {
            let fileToUpdate = fileLocation.parent[fileLocation.key];
            fileToUpdate.metadata = newData.metadata !== undefined ? JSON.stringify(newData.metadata) : fileToUpdate.metadata;
            fileToUpdate.fileName = newData.fileName !== undefined ? newData.fileName : fileLocation.key;
            fileToUpdate.type = newData.type !== undefined ? newData.type : fileToUpdate.type;

            if (newData.fileName !== undefined && newData.fileName !== fileLocation.key) {
                fileLocation.parent[newData.fileName] = fileToUpdate;
                delete fileLocation.parent[fileLocation.key];
            }

            if (newData.content !== undefined) {
                contentpool[fileId] = newData.content;
            }

            await setdb("modify file");
            eventBusWorker.deliver({
                "type":"memory",
                "event":"update",
                "id":"updateFile"
            });
            console.log(`Modified: "${fileToUpdate.fileName}"`);
        } else {
            console.log(`Creating New: "${fileId}"`);
            targetFolder[newData.fileName || `NewFile_${fileId}`] = {
                id: fileId,
                metadata: newData.metadata ? JSON.stringify(newData.metadata) : '',
                type: newData.type || ''
            };

            contentpool[fileId] = newData.content || '';

            await setdb("create new file");
            eventBusWorker.deliver({
                "type":"memory",
                "event":"update",
                "id":"createFile"
            });
        }
    } catch (error) {
        console.error("Error updating file:", error);
    }
}

function createFolderStructure(folderName) {
    let parts = folderName.split('/');
    let current = memory.root;
    for (let part of parts) {
        part += '/';
        if (!current[part]) {
            current[part] = {};
        }
        current = current[part];
    }
    return current;
}

async function createFile(folderName, fileName, type, content, metadata = {}) {
    folderName = folderName.endsWith('/') ? folderName : folderName + '/';
    const fileNameWithExtension = fileName.includes('.') ? fileName : `${fileName}.${type || ''}`.trim();

    if (!fileNameWithExtension) return null;

    type = type || fileNameWithExtension.split('.').pop();

    await updateMemoryData();

    if (!folderExists(folderName)) await createFolder(folderName);

    const folder = memory.root[folderName] || {};

    try {
        let base64data = isBase64(content) ? content : '';

        if (!base64data) {
            const mimeType = type ? `application/${type}` : 'application/octet-stream';
            const blob = new Blob([content], { type: mimeType });
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async function () {
                base64data = reader.result;
                await handleFile(folder, folderName, fileNameWithExtension, base64data, type, metadata);
            };
        } else {
            await handleFile(folder, folderName, fileNameWithExtension, base64data, type, metadata);
        }
    } catch (error) {
        console.error("Error in createFile:", error);
        return null;
    }

    async function handleFile(folder, folderName, fileNameWithExtension, base64data, type, metadata) {
        if (base64data == "" || !base64data) {
            base64data = `data:${await getMimeType(type)};base64,`
        }
        if (type === "app" && fileNameWithExtension.endsWith(".app")) {
            const appData = await getFileByPath(`Apps/${fileNameWithExtension}`);
            if (appData) {
                await updateFile("Apps/", appData.id, { metadata, content: base64data, fileName: fileNameWithExtension, type });
                await extractAndRegisterCapabilities(appData.id, base64data);
                return appData.id || null;
            }
        }

        const existingFile = Object.values(folder).find(file => file.fileName === fileNameWithExtension);
        if (existingFile) {
            await updateFile(folderName, existingFile.id, { metadata, content: base64data, fileName: fileNameWithExtension, type });
            return existingFile.id;
        } else {
            const uid = genUID();
            memory.root[folderName] = folder;
            metadata.datetime = getfourthdimension();
            folder[fileNameWithExtension] = { id: uid, type, metadata };
            if (fileNameWithExtension.endsWith(".app")) extractAndRegisterCapabilities(uid, base64data);
            contentpool[uid] = base64data;
            await setdb("handling file: " + fileNameWithExtension);
            eventBusWorker.deliver({
                "type":"memory",
                "event":"update",
                "id":"updateFile"
            });
            return uid;
        }
    }
}

function dragfl(ev, obj) {
    ev.dataTransfer.setData("Text", obj.getAttribute('unid'));
}

async function crashScreen(err) { 
    closeallwindows();
    await say(`
        <h1>Your System is curropt.</h1>
        <p>Reload your OS to continue.<p>
        <code>${err}</code>
        `, "failed");
    if (badlaunch) {return}
    location.reload()
}