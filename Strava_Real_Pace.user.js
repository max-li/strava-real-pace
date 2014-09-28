// ==UserScript==
// @name        Strava Real Pace
// @namespace   http://www.maxli.org
// @description Replaces moving pace with real pace on Strava
// @include     http://www.strava.com/*
// @version     1
// @grant       GM_xmlhttpRequest
// ==/UserScript==


var activityNodes = {};
var apiURL = '';
var updateFunction = null;

if (document.URL.startsWith('http://www.strava.com/dashboard')) {
  var paceNodes = document.querySelectorAll("[title='Average Pace']");
  for (var i = 0; i < paceNodes.length; i++) {
    var node = paceNodes[i];
    activityNodes[node.parentElement.parentElement.parentElement.parentElement.parentElement.id.slice(9)] = node;
  }
  apiURL = 'https://www.strava.com/api/v3/athlete/activities?per_page=10'
  updateFunction = updateActivities;
} else if (document.URL.startsWith('http://www.strava.com/activities/')) {
  var activityId = document.URL.slice(33);
  var paceNode = document.querySelector("[title='minutes per mile']").previousSibling;
  activityNodes[activityId] = paceNode;
  apiURL = 'https://www.strava.com/api/v3/activities/' + activityId;
  updateFunction = function(response) { updateActivity(JSON.parse(response.responseText), ''); };
}

GM_xmlhttpRequest({
  method: 'GET',
  url: apiURL,
  headers: {
    'Authorization': 'Bearer REPLACEWITHACCESSTOKEN'
  },
  onload: updateFunction
});

function calculatePace(distance, time) {
  var timeInMinutes = time / 60;
  var distanceInMiles = distance / 1609.34;
  var pace = timeInMinutes / distanceInMiles;
  var paceMinutes = Math.floor(pace);
  var paceSeconds = Math.floor((pace - paceMinutes) * 60);
  return paceMinutes + ':' + paceSeconds;
}

function updateActivity(activity, suffix) {
  var id = activity.id;
  if (id in activityNodes) {
    activityNodes[id].textContent = calculatePace(activity.distance, activity.elapsed_time) + suffix;
  }
}

function updateActivities(response) {
  var activities = JSON.parse(response.responseText);
  for (var activity of activities) {
    updateActivity(activity, ' / mile');
  }
}
