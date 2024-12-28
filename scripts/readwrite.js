let dbCache = null;
let cryptoKeyCache = null;
const key = 'dataStore';
async function openDB(databaseName, version) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, version);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains('dataStore')) {
                db.createObjectStore('dataStore', { keyPath: 'key' });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);

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

    const transaction = dbCache.transaction(key, 'readwrite');
    const store = transaction.objectStore(key);
    const request = store.get(CurrentUsername);

    return new Promise((resolve, reject) => {
        request.onsuccess = async () => {
            const result = request.result || { key: CurrentUsername || 'Admin', memory: {}, contentpool: {} };
            result.memory = value.memory;

            const updateRequest = store.put(result);
            updateRequest.onsuccess = resolve;
            updateRequest.onerror = () => reject(updateRequest.error);
        };

        request.onerror = () => reject(request.error);
    });
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
                        memory = result.memory;
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

function setdb(x) {
    console.log("flushing... ", x)
    const value = {
        memory: { ...memory }
    };

    return flushDB(value)
        .catch(error => console.error("Error during setdb execution:", error));
}
let requestQueue = [];
let isProcessing = false;

async function processQueue() {
    if (isProcessing || requestQueue.length === 0) {
        return;
    }

    isProcessing = true;

    while (requestQueue.length > 0) {
        const { resolve, reject, action, args } = requestQueue.shift();
        try {
            const result = await action(...args);
            resolve(result);
        } catch (error) {
            reject(error);
        }
    }

    isProcessing = false;
}

async function enqueueRequest(action, args) {
    return new Promise((resolve, reject) => {
        requestQueue.push({ resolve, reject, action, args });
        processQueue();
    });
}

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
                        reject(error);
                    }
                } else {
                    reject(new Error('File not found'));
                }
            };

            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        throw error;
    }
}

async function setFileContents(id, content) {
    if (!dbCache) {
        dbCache = await openDB(databaseName, 1);
    }
    if (!cryptoKeyCache) {
        cryptoKeyCache = await getKey(password);
    }

    try {
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
                    updateRequest.onsuccess = () => resolve();
                    updateRequest.onerror = () => reject(updateRequest.error);
                } else {
                    reject(new Error('User data not found'));
                }
            };

            request.onerror = () => reject(request.error);
        });
    } catch (error) {
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
                    delete result.contentpool[id];

                    const updateRequest = store.put(result);
                    updateRequest.onsuccess = () => resolve();
                    updateRequest.onerror = () => reject(updateRequest.error);
                } else {
                    reject(new Error('File not found'));
                }
            };

            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        throw error;
    }
}


const ctntMgr = {
    async get(id) {
        try {
            return await enqueueRequest(getFileContents, [id]);
        } catch (error) {
            throw error;
        }
    },

    async set(id, content) {
        try {
            return await enqueueRequest(setFileContents, [id, content]);
        } catch (error) {
            throw error;
        }
    },

    async remove(id) {
        try {
            return await enqueueRequest(removeFileContents, [id]);
        } catch (error) {
            throw error;
        }
    }
};
