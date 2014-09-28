// ==UserScript==
// @name        Strava Real Pace
// @namespace   http://www.maxli.org
// @description Replaces moving pace with real pace on Strava
// @include     http://www.strava.com/dashboard
// @version     1
// @grant       GM_xmlhttpRequest
// ==/UserScript==

var paceNodes = document.querySelectorAll("[title='Average Pace']");

var activityNodes = {};
for (var i = 0; i < paceNodes.length; i++) {
  var node = paceNodes[i];
  activityNodes[node.parentElement.parentElement.parentElement.parentElement.parentElement.id.slice(9)] = node;
}

GM_xmlhttpRequest({
  method: 'GET',
  url: 'https://www.strava.com/api/v3/athlete/activities?per_page=10',
  headers: {
    'Authorization': 'REPLACE ME'
  },
  onload: updateActivities
});

function calculatePace(distance, time) {
  var timeInMinutes = time / 60;
  var distanceInMiles = distance / 1609.34;
  var pace = timeInMinutes / distanceInMiles;
  var paceMinutes = Math.floor(pace);
  var paceSeconds = Math.floor((pace - paceMinutes) * 60);
  return paceMinutes + ':' + paceSeconds + ' per mile';
}

function updateActivities(response) {
  var activities = JSON.parse(response.responseText);
  for (var activity of activities) {
    var id = activity.id;
    if (id in activityNodes) {
      activityNodes[id].textContent = calculatePace(activity.distance, activity.elapsed_time);
    }
  }
}
