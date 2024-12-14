let dbCache = null;
let cryptoKeyCache = null;
const key = 'dataStore';


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
        encryptedContentPool[id] = await encryptData(
            cryptoKeyCache, 
            compressString(value.contentpool[id])
        );
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
        await say("Sorry, but your actions caused severe issues to the long term storage of NovaOS, click OK to reload.");
        location.reload();
        console.error("Error in getdb function:", error);
        throw error;
    }
}

// Lazy loading of file content by ID
async function getFileContents(id) {
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
                if (result && result.contentpool && result.contentpool[id]) {
                    try {
                        const encryptedContent = result.contentpool[id];
                        const decryptedContent = await decryptData(cryptoKeyCache, encryptedContent);
                        const uncompressedContent = decompressString(decryptedContent);
                        resolve(uncompressedContent);
                    } catch (error) {
                        console.error("Error during decryption or decompression:", error);
                        reject(error);
                    }
                } else {
                    reject(new Error('File not found'));
                }
            };

            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("Error in getFileContents:", error);
        throw error;
    }
}

// Setter for file contents by ID, encrypting and storing the contentpool
async function setFileContents(id, content) {
    if (!dbCache) {
        dbCache = await openDB(databaseName, 1);
    }
    if (!cryptoKeyCache) {
        cryptoKeyCache = await getKey(password);
    }

    try {
        // Encrypt and compress the content before saving
        const encryptedContent = await encryptData(cryptoKeyCache, compressString(content));

        const transaction = dbCache.transaction('dataStore', 'readwrite');
        const store = transaction.objectStore('dataStore');

        const request = store.get(CurrentUsername);

        return new Promise((resolve, reject) => {
            request.onsuccess = async () => {
                const result = request.result;
                if (result) {
                    result.contentpool = result.contentpool || {};
                    result.contentpool[id] = encryptedContent;

                    const updateRequest = store.put(result);
                    updateRequest.onsuccess = resolve;
                    updateRequest.onerror = () => reject(updateRequest.error);
                } else {
                    reject(new Error('User data not found'));
                }
            };

            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("Error in setFileContents:", error);
        throw error;
    }
}

async function removeFileContents(id) {
    if (!dbCache) {
        dbCache = await openDB(databaseName, 1);
    }

    try {
        const transaction = dbCache.transaction('dataStore', 'readwrite');
        const store = transaction.objectStore('dataStore');

        const request = store.get(CurrentUsername);

        return new Promise((resolve, reject) => {
            request.onsuccess = async () => {
                const result = request.result;
                if (result && result.contentpool && result.contentpool[id]) {
                    // Remove the content for the specified ID
                    delete result.contentpool[id];

                    const updateRequest = store.put(result);
                    updateRequest.onsuccess = resolve;
                    updateRequest.onerror = () => reject(updateRequest.error);
                } else {
                    reject(new Error('File not found'));
                }
            };

            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("Error in removeFileContents:", error);
        throw error;
    }
}

const ctntMgr = {
    async get(id) {
        try {
            return await getFileContents(id);
        } catch (error) {
            throw error;
        }
    },

    async set(id, content) {
        try {
            return await setFileContents(id, content);
        } catch (error) {
            throw error;
        }
    },

    async remove(id) {
        try {
            return await removeFileContents(id);
        } catch (error) {
            throw error;
        }
    }
};