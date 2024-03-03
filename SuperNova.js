
const databaseName = 'trojencat';
// Function to open or create an IndexedDB database
function openDB(databaseName, version) {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(databaseName, version);

		request.onupgradeneeded = (event) => {
			const db = event.target.result;
			db.createObjectStore('store', { keyPath: 'key' });
		};

		request.onsuccess = () => {
			resolve(request.result);
		};

		request.onerror = () => {
			reject(request.error);
		};
	});
}

// Function to set a key-value pair in the database
function setdb(databaseName, key, value) {
	return openDB(databaseName, 1).then((db) => {
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(['store'], 'readwrite');
			const store = transaction.objectStore('store');
			const request = store.put({ key, value });

			request.onsuccess = () => {
				resolve();
			};

			request.onerror = () => {
				reject(request.error);
			};
		});
	});
}

// Function to get a value by key from the database
function getdb(databaseName, key) {
	return openDB(databaseName, 1).then((db) => {
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(['store'], 'readonly');
			const store = transaction.objectStore('store');
			const request = store.get(key);

			request.onsuccess = () => {
				const result = request.result;
				if (result) {
					resolve(result.value);
				} else {
					resolve(null); // Key not found
				}
			};

			request.onerror = () => {
				reject(request.error);
			};
		});
	});
}