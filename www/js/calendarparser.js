
function start_database(path)
{
	window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
	window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
	window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

	const dbname = "TesttttttDB";

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
		pop_loading(true);
		var objectStore = db.createObjectStore("events", { keyPath: "ID", autoIncrement: true});
		objectStore.createIndex("name", "name", {unique: false});
		$.get(path, {}, function(res) {

			//code here to alert the user that we're doing something to prepare their page please

			//objectStore.transaction.oncomplete = function(event) {
			var transaction = db.transaction("events","readwrite");
			transaction.oncomplete = function(event) {
				pop_loading(false);
			};
			var q = [ {ID: 5, name: "John", size: "Medium"}, {name: "Jill", size: "Small"}];
			var objectAdder = transaction.objectStore("events");
			for (var i in q) {
				objectAdder.add(q[i]);
			}
			//};
			pop_error(res);
		});
		

	};


}