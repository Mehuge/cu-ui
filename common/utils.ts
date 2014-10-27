module Utils {
    export function indexedDBPersistenceTest() {
        var req = window.indexedDB.open("persist_test", 1);
        req.onupgradeneeded = function (e : IDBVersionChangeEvent) {
            console.log('upgrade needed');
            var db = req.result;
            var store = db.createObjectStore("test", { keyPath: "key" });
            store.put({ "key": "1", value: "hello" });
            console.log('record added');
        };
        req.onsuccess = function (e : Event) {
            console.log('db open');
            var db = req.result;
            var tx = db.transaction("test");
            var store = tx.objectStore("test");
            var req = store.get(IDBKeyRange.only("1"));
            req.onsuccess = function (e) {
                var cursor = e.target.result;
                console.log('value ' + cursor.value);
            }
        };
    };
    export function localStoragePersistenceTest() {
        var value = localStorage.getItem("1");
        if (!value) {
            console.log('value does not exist, create it');
            localStorage.setItem("1", "hello");
        } else {
            console.log('value from local storage is ' + value);
        }
    };
}; 

// Utils.localStoragePersistenceTest();
// Utils.indexedDBPersistenceTest();
