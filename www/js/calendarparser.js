
function start_database(path)
{
	window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
	window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
	window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

	const dbname = "TestDB";

	var db;
	var request = window.indexedDB.open(dbname, 1);
	request.onerror = function(event) {
		pop_error(event);
	};
	request.onsuccess = function(event) {
		db = event.target.result;
		db.onerror = function(event) {
			pop_error("Database error: " + event);
		};
		db.transaction("events").objectStore("events").get(6).onsuccess = function(event) {
			pop_error(event.target.result.name + " " + event.target.result.size);
		};
	};
	request.onupgradeneeded = function(event) {
		db = event.target.result;
		db.onerror = function(event) {
			pop_error("Database error: " + event);
		};
		//code here to alert the user that we're doing something to prepare their page please



		// $.get(path, {}, function(res) {
			
		// });

		var objectStore = db.createObjectStore("events", { keyPath: "ID", autoIncrement: true});
		objectStore.createIndex("name", "name", {unique: false});
		objectStore.transaction.oncomplete = function(event) {
			var q = [ {ID: 5, name: "John", size: "Medium"}, {name: "Jill", size: "Small"} ];
			var objectAdder = db.transaction("events", "readwrite").objectStore("events");
			for (var i in q) {
				objectAdder.add(q[i]);
			}
		};

	};


}

// indexedDB.db = null;
// indexedDB.onerror = function(e) {
// 	pop_error(e);
// };

// indexedDB.open = function() {
// 	var version = "1.0";
// 	var request = indexedDB.open("foo",v);

// 	request.onupgradeneeded = function(e) {
// 		var db = request.result;
// 		var store = db.createObjectStore("foos", {keyPath: "ID"});
// 	};

// 	request.onsuccess = function(e) {
// 		indexedDB.db = e.target.result;

// 		pop_error("Success");
// 	};

// 	request.onfailure = indexedDB.onerror;

// };