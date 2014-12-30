window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

const dbname = "Events_44";
function start_database(path,path2)
{
	var updatingdb = false; //Sets to true if the database has to be populated.
	var db;
	var request = window.indexedDB.open(dbname, 1);
	request.onerror = function(event) {
		pop_error(event);
	};
	request.onsuccess = function(event) {
		if(!updatingdb)
		{
			db = event.target.result;
			db.onerror = function(event) {
				pop_error("Database error: " + event);
			};
			//This is creating an error. Hunt it down and kill it.
			//calendarparser.js:22 Uncaught TypeError: Cannot read property 'name' of undefined
			// db.transaction("events").objectStore("events").get(1).onsuccess = function(events) {
			// 	pop_error(events.target.result);
			// };
			database_started(db);
		}
	};
	request.onupgradeneeded = function(event) {
		pop_error("Updating DB");
		db = event.target.result;
		updatingdb = true;
		db.onerror = function(event) {
			pop_error("Database error: " + event);
		};
		pop_loading(true);
		var objectStore = db.createObjectStore("events", {autoIncrement: true});
		objectStore.createIndex("flags", "flags", {unique: false});
		objectStore.createIndex("current_date", "current_date", {unique: false});
		//var finishedAdding = false;
		objectStore.transaction.oncomplete = function(event) {
			$.ajax({ url: path, async: true, success: function(res) {
				$.ajax({ url: path2, async: true, success: function(res2){
					res = res + "\n" + res2;
					var transaction = db.transaction("events", "readwrite");
					transaction.oncomplete = function(event) {
						
						database_started(db);
					};

					var objectAdder = transaction.objectStore("events");

					var finished_parsing_cal = false;
					var lines = res.split('\n');
					var i = 0;
					var filesended = 0;
					var eventarray = [];
					while (finished_parsing_cal == false)
					{
						var line = lines[i].trim();
						if(line == 'END:VCALENDAR')
						{
							filesended++;
							if(filesended == 2)
							{
								//We have parsed both files. Finished loop.
								finished_parsing_cal = true;
							}
						}
						else
						{
							if(line == 'BEGIN:VEVENT')
							{
								i++; //Automove to the next bit
								var finished_parsing_evt = false;
								var eventobj = { start_date:-1, start_hour: -1, start_minute: -1,
									start_second: -1, end_date: -1, end_hour: -1, end_minute: -1,
									end_second: -1, name:"NO_NAME", location:"", status:"CONFIRMED",
									fulltext: "", flags: 0, current_date:-1
								};
								while(finished_parsing_evt == false)
								{
									line = lines[i].trim();
									if(line == 'END:VEVENT')
									{
										finished_parsing_evt = true;
									}
									else
									{
										//parse event here
										//var field = line.substring(0,line.search(":"));
										var firstcolon = line.indexOf(":");
										var firstsemi = line.indexOf(";");
										var field = "";
										var subfield = "";
										var value = line.substring(firstcolon+1,line.length);
										if(firstcolon < firstsemi || firstsemi < 0)
										{
											field = line.substring(0, firstcolon);
										}
										else
										{
											field = line.substring(0, firstsemi);
											subfield = line.substring(firstsemi+1,firstcolon);
										}

										/*

										Parse Start/End Date

										*/

										if(field == "DTSTART" || field == "DTEND")
										{
											//Date format: YYYYMMDDTHHMMSSZ
											//Last digit:  0123456789012345
											//T indicates the switch to time
											//Z indicates that the time is in UTC


											var date = value.substr(0,8);
											var date_only = false;

											// var year = value.substring(0,4);
											// var month = value.substring(4,6);
											// var day = value.substring(6,8);
											if(subfield != "VALUE=DATE")
											{
												var hour = value.substr(9,2);
												var minute = value.substr(11,2);
												var second = value.substr(13,2);
											}
											else
											{
												date_only = true;
												var hour = -1;
												var minute = -1;
												var second = -1;
											}

											if(field == "DTSTART")
											{
												eventobj.start_date = date;
												eventobj.start_hour = hour;
												eventobj.start_minute = minute;
												eventobj.start_second = second;
											}
											else
											{
												if(date_only)
												{
													var end_date = new Date(date.substring(0,4),date.substring(4,6)-1,
														date.substring(6,8));

													end_date.setDate(end_date.getDate() - 1);

													end_date_string = zero_pad(end_date.getFullYear(),4).toString() + 
														zero_pad((end_date.getMonth()+1),2).toString() + zero_pad(end_date.getDate(),2).toString();

													eventobj.end_date = end_date_string;
												}
												else
												{
													eventobj.end_date = date;
												}

												eventobj.end_hour = hour;
												eventobj.end_minute = minute;
												eventobj.end_second = second;
											}
										}
										else if(field == "SUMMARY")
										{
											eventobj.name = value;
										}
										else if(field == "LOCATION")
										{
											eventobj.location = value;
										}
										else if(field == "STATUS")
										{
											eventobj.status = value;
											//Tentative, Confirmed, or Cancelled
											//All caps of course
											//SDS doesn't seem to use Tentative but I can't be sure
										}
										else if(field == "DESCRIPTION")
										{
											eventobj.fulltext = value;
										}
										else if(field == "CATEGORIES")
										{
											/*
											Possible values for calendar and bit flag:
											0  Break
											1  Timetable 
											2  Event
											3  Lesson
											4  Course
											5  Admissions
											6  Parents' Auxiliary
											7  Boarding
											8  Education Extension
											9  Alumni
											10 School Events
											11 Junior School
											12 Middle School
											13 Senior School
											14 Athletics [Middle School: Athletics, Senior School: Athletics]
											15 Academics [Senior School: Academics]
											16 Arts [Senior School: Arts]
											17 Leadership & Service [Senior School: Leadership & Service]
											18 Clubs & Councils [Senior School: Clubs & Councils]
											19 Outdoor Education [Senior School: Outdoor Education]
											20 University Visits [Senior School: University Visits]
											21 Field Hockey [Senior School: Athletics: Field Hockey]
											22 Rugby [Senior School: Athletics: Rugby]
											23 Squash [Senior School: Athletics: Squash]
											24 Volleyball [Senior School: Athletics: Volleyball]
											25 Soccer [Senior School: Athletics: Soccer]
											26 Basketball [Senior School: Athletics: Basketball] 
											27 Timetable override
											
											Note: Good form will be to tag an event with ALL tags
											applicable to it, regardless of whether it possesses
											that tag in the SDS system, eg. a Field Hockey game
											should be tagged Senior School, Athletics, and Field Hockey
											(assuming it is played by Senior School).
											*/
											pow = Math.pow

											eventobj.flags |= get_flags(value);
										}
										else if(field == "UID")
										{
											if(value.indexOf("period_override") != -1)
											{
												eventobj.flags |= Math.pow(2,27);
											}
										}
										else
										{
											//Did not process
										}

										i++;
									}
								}

								var done_adding = false;
								var current_date = new Date(eventobj.start_date.substring(0,4),eventobj.start_date.substring(4,6)-1,
									eventobj.start_date.substring(6,8));
								var end_date = new Date(eventobj.end_date.substring(0,4),eventobj.end_date.substring(4,6)-1,
									eventobj.end_date.substring(6,8));
								var m = 0;
								while(!done_adding)
								{
									current_date.setDate(current_date.getDate()+m);

									current_date_string = zero_pad(current_date.getFullYear(),4).toString() + 
										zero_pad((current_date.getMonth()+1),2).toString() + zero_pad(current_date.getDate(),2).toString();

									if(m == 1)
									{
										console.log(eventobj.name + ": " + current_date_string);
									}

									eventobj.current_date = current_date_string;
									objectAdder.add(eventobj);
									
									if(current_date.getTime() == end_date.getTime())
									{
										done_adding = true;
									}
									m=1;
								}
							}
						}
						i++;
					}
					
					// var q = [ {ID: 5, name: "John", size: "Medium"}, {name: "Jill", size: "Small"}];
					// for (var i in q) {
					// 	objectAdder.add(q[i]);
					// }
					// //};
				}});
			//finishedAdding = true;
			}});
		};
		updatingdb = false;
	};
}


function database_started(db)
{
	event_database = db;

	var today = new Date();
	var d = new Date(today.getFullYear(),today.getMonth(),today.getDate(),12);
	var daystring = zero_pad(d.getFullYear(),4)+zero_pad(d.getMonth()+1,2)+zero_pad(d.getDate(),2);

	console.log("dbstart");
	populate_days("page_1",daystring,true);

	// var x = $(".day");
	// for(var i=0; i<x.length; i++)
	// {
	// 	$(".daypara",$(x[i])).html(x[i].id);
	// }
	pop_loading(false);
	 //Trying to assign a global here
	// var objectStore = db.transaction("events").objectStore("events");
	// objectStore.openCursor().onsuccess = function(event) {
	// 	var cursor = event.target.result;
	// 	if(cursor)
	// 	{
	// 		cursor.continue();
	// 	}
	// };
}

function populate_events(current_date){

}


//This method doesn't work because the API is asynchronous
function get_events_for(date) {
	var objectStore = event_database.transaction("events").objectStore("events");
	var keyRange = IDBKeyRange.only(date);
	objectStore.index("current_date").openCursor(keyRange).onsuccess = function(event) {
		var cursor = event.target.result;
		if(cursor) {
			console.log(cursor.value.name);
			cursor.continue();
		}
	}
}

function get_flags(value)
{
	flags = 0;

	if(value.indexOf("Break") > -1)
	{
		flags |= pow(2,0);
	}
	if(value.indexOf("Timetable") > -1)
	{
		flags |= pow(2,1);
	}
	if(value.indexOf("Event") > -1) //Intentional: Will include school events.
	{
		flags |= pow(2,2);
	}
	if(value.indexOf("Lesson") > -1)
	{
		flags |= pow(2,3);
	}
	if(value.indexOf("Course") > -1)
	{
		flags |= pow(2,4);
	}
	if(value.indexOf("Admissions") > -1)
	{
		flags |= pow(2,5);
	}
	if(value.indexOf("Parents' Auxiliary") > -1)
	{
		flags |= pow(2,6);
	}
	if(value.indexOf("Boarding") > -1)
	{
		flags |= pow(2,7);
	}
	if(value.indexOf("Education Extension") > -1)
	{
		flags |= pow(2,8);
	}
	if(value.indexOf("Alumni") > -1)
	{
		flags |= pow(2,9);
	}
	if(value.indexOf("School Events") > -1)
	{
		flags |= pow(2,10);
	}
	if(value.indexOf("Junior School") > -1)
	{
		flags |= pow(2,11);
	}
	if(value.indexOf("Middle School") > -1)
	{
		flags |= pow(2,12);
	}
	if(value.indexOf("Senior School") > -1)
	{
		flags |= pow(2,13);
	}
	if(value.indexOf("Athletics") > -1)
	{
		flags |= pow(2,14);
	}
	if(value.indexOf("Academics") > -1)
	{
		flags |= pow(2,15);
	}
	if(value.indexOf("Arts") > -1)
	{
		flags |= pow(2,16);
	}
	if(value.indexOf("Leadership & Service") > -1)
	{
		flags |= pow(2,17);
	}
	if(value.indexOf("Clubs & Councils") > -1)
	{
		flags |= pow(2,18);
	}
	if(value.indexOf("Outdoor Education") > -1)
	{
		flags |= pow(2,19);
	}
	if(value.indexOf("University Visits") > -1)
	{
		flags |= pow(2,20);
	}
	if(value.indexOf("Field Hockey") > -1)
	{
		flags |= pow(2,21);
	}
	if(value.indexOf("Rugby") > -1)
	{
		flags |= pow(2,22);
	}
	if(value.indexOf("Squash") > -1)
	{
		flags |= pow(2,23);
	}
	if(value.indexOf("Volleyball") > -1)
	{
		flags |= pow(2,24);
	}
	if(value.indexOf("Soccer") > -1)
	{
		flags |= pow(2,25);
	}
	if(value.indexOf("Basketball") > -1)
	{
		flags |= pow(2,26);
	}
	return flags;
}