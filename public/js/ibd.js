let db;

const request = indexedDB.open('gotta-keep-traveling', 1);

request.onupgradeneeded = function (e) {
  const db = e.target.result;
  db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function (e) {
  db = e.target.result;
  if (navigator.onLine) {
    uploadTransaction();
  }
};

request.onerror = function (e) {
  console.log(e.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(['new_transaction'], 'readwrite');
  const transObjectStore = transaction.objectStore('new_transaction');
  transObjectStore.add(record);
}

function uploadTransaction() {
  const transaction = db.transaction(['new_transaction'], 'readwrite');

  const budgetObjectStore = transaction.objectStore('new_transaction');

  const getAll = budgetObjectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          const transaction = db.transaction(['new_transaction'], 'readwrite');

          const budgetObjectStore = transaction.objectStore('new_transaction');

          budgetObjectStore.clear();

          alert('All saved transactions has been submitted!');
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

window.addEventListener('online', uploadTransaction);