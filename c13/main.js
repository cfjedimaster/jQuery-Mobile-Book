//used for caching
var feedCache= {};

function init() {

	//handle getting and displaying the intro or feeds	
	$(document).on("pageshow", "#intropage", function(e) {
		displayFeeds();
	});
	
	//Listen for the addFeedPage so we can support adding feeds
	$(document).on("pageshow", "#addfeedpage", function(e) {
		console.log('dojngpageshow');
		$("#addFeedForm").submit(function(e) {
			console.log('handle submit');
			handleAddFeed();
			return false;
		});
	});

	//Listen for delete operations
	$(document).on("touchend", ".deleteFeed", function(e) {
		var delId = $(this).jqmData("feedid");
		removeFeed(delId);
	});
	
	//Listen for the Feed Page so we can display entries
	$(document).on("pageshow", "#feedpage",  function(e) {
		//get the feed id based on query string
		var query = $(this).data("url").split("=")[1];
		//remove ?id=
		query = query.replace("?id=","");
		//assume it's a valid ID, since this is a mobile app folks won't be messing with the urls, but keep
		//in mind normally this would be a concern
		var feeds = getFeeds();
		var thisFeed = feeds[query];
		$("h1",this).text(thisFeed.name);
		if(!feedCache[thisFeed.url]) {
			$("#feedcontents").html("<p>Fetching data...</p>");
			//now use Google Feeds API
			$.get("https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&q="+encodeURI(thisFeed.url)+"&callback=?", {}, function(res,code) {
				//see if the response was good...
				if(res.responseStatus == 200) {
					feedCache[thisFeed.url] = res.responseData.feed.entries;
					displayFeed( thisFeed.url);
				} else {
					var error = "<p>Sorry, but this feed could not be loaded:</p><p>"+res.responseDetails+"</p>";
					$("#feedcontents").html(error);
				}
			},"json");
		} else {
			displayFeed(thisFeed.url);
		}
		
	});
	
	//Listen for the Entry Page so we can display an entry
	$(document).on("pageshow", "#entrypage", function(e) {
		//get the entry id and url based on query string
		var query = $(this).data("url").split("?")[1];
		//remove ?
		query = query.replace("?","");
		//split by &
		var parts = query.split("&");
		var entryid = parts[0].split("=")[1];
		var url = parts[1].split("=")[1];
		
		var entry = feedCache[url][entryid];
		$("h1",this).text(entry.title);
		$("#entrycontents",this).html(entry.content);
		$("#entrylink",this).attr("href",entry.link);
	});	
}

function displayFeed(url) {
	var entries = feedCache[url];
	var s = "<ul data-role='listview' data-inset='true' id='entrylist'>";
	for(var i=0; i<entries.length; i++) {
		var entry = entries[i];
		s += "<li><a href='entry.html?entry="+i+"&url="+encodeURI(url)+"'>"+entry.title+"</a></li>";
	}
	s += "</ul>";

	$("#feedcontents").html(s);
	$("#entrylist").listview();						
}

function displayFeeds() {
	var feeds = getFeeds();
	if(feeds.length == 0) {
		//in case we had one form before...
		$("#feedList").html("");
		$("#introContentNoFeeds").show();
	} else {
		$("#introContentNoFeeds").hide();
		var s = "";
		for(var i=0; i<feeds.length; i++) {
			s+= "<li><a href='feed.html?id="+i+"' data-feed='"+i+"'>"+feeds[i].name+"</a> <a href='' class='deleteFeed' data-feedid='"+i+"'>Delete</a></li>";
		}
		$("#feedList").html(s);
		$("#feedList").listview("refresh");
	}	
}

//handles checking storage for your feeds
function getFeeds() {
	if(localStorage["feeds"]) {
		return JSON.parse(localStorage["feeds"]);
	} else return [];
}

function addFeed(name,url) {
	var feeds = getFeeds();
	feeds.push({name:name,url:url});
	localStorage["feeds"] = JSON.stringify(feeds);
}

function removeFeed(id) {
	var feeds = getFeeds();
	feeds.splice(id, 1);
	localStorage["feeds"] = JSON.stringify(feeds);
	displayFeeds();
}

function handleAddFeed() {
	var feedname = $.trim($("#feedname").val());
	var feedurl = $.trim($("#feedurl").val());
	
	//basic error handling
	var errors = "";
	if(feedname == "") errors += "Feed name is required.\n";
	if(feedurl == "") errors += "Feed url is required.\n";
	
	if(errors != "") {
		//Create a PhoneGap notification for the error
		navigator.notification.alert(errors, function() {});
	} else {
		addFeed(feedname, feedurl);
		$.mobile.changePage("index.html");
	}
}