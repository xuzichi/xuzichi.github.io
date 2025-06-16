import orangeModule from "/js/orangeModule.js";

// Constants and initial settings
var speed = 0;
var timeout;
var allowedMins = 5;
var allowedTime = 60 * 1000 * allowedMins;
if (timeAllowanceChanged) {
  allowedMins = speedData.object.allowance.time;
  allowedTime = 60 * 1000 * allowedMins;
}

var num = 0;
var watch_id;
var minSpeed = speedData.object.speed.min;
var maxSpeed = speedData.object.speed.max;
var areaArray = speedData.object.area;
console.log("Area Array:", areaArray);
var positionHistory = [];
var conditionMetCount = 0;
var requiredMeasurements = 3;

function checkRide() {
  console.log("checkRide() called");
  orangeModule
    .getRideHistoryFromOrange()
    .then((history) => {
      console.log("Ride history fetched", history);
      var lastRide = history.data.ride_histories[0];
      if (!lastRide) return checkStatus();

      var checkTimeOk = checkAllowedTime(allowedTime, lastRide.ride_date);
      var checkSpeedOk = checkSpeed(lastRide.speed);
      var checkAreaOk = checkArea(lastRide.latitude, lastRide.longitude);
      var direction = lastRide.direction === "上り" ? "towards" : "away";
      var checkDirectionOk = targetRequired
        ? checkDirection(speedData.object.target.direction, direction)
        : true;

      console.log("Conditions", {
        checkTimeOk,
        checkSpeedOk,
        checkAreaOk,
        checkDirectionOk,
      });
      if (checkTimeOk && checkSpeedOk && checkAreaOk && checkDirectionOk) {
        requirementMet();
      } else {
        checkStatus();
      }
    })
    .catch(console.error);
}

function formatAllowedTime(mins) {
  console.log("formatAllowedTime() called", mins);
  if (mins < 60) return mins + "分";
  var h = Math.floor(mins / 60);
  var m = mins % 60;
  return m === 0 ? h + "時間" : h + "時間" + m + "分間";
}

function updateSpeedometer(speed) {
  console.log("updateSpeedometer() called", speed);
  var angle = -90 + (speed * 180) / 350;
  document
    .getElementById("needle")
    .setAttribute("transform", `rotate(${angle},50,50)`);
}

function checkStatus() {
  console.log("checkStatus() called");
  if (isInAppBrowser())
    showAlert(
      "アプリ内ブラウザのため、動作が不安定な場合があります。\nSafariやChromeをご利用ください。"
    );

  sessionStorage.removeItem("openedSurvey");
  watch_id = navigator.geolocation.watchPosition(returnStatus, showError, {
    enableHighAccuracy: true,
    timeout: 3600000,
    maximumAge: 0,
  });

  showCalculating();
}

function checkSpeed(s) {
  console.log("checkSpeed() called", s);
  $(".speedMeter")
    .toggleClass("green", minSpeed <= s && s < maxSpeed)
    .toggleClass("red", !(minSpeed <= s && s < maxSpeed));

  console.log("Speed check result:", minSpeed <= s && s < maxSpeed);
  return minSpeed <= s && s < maxSpeed;
}

function checkArea(lat, lon) {
  console.log("checkArea() called", {
    lat,
    lon,
  });
  var inArea = false;
  $(".lat, .lon").removeClass("green").addClass("red");
  // console.log(areaArray);
  areaArray.forEach(function (area) {
    var maxLat = area[0];
    var maxLon = area[1];
    var minLat = area[2];
    var minLon = area[3];
    if (maxLat > lat && lat > minLat && maxLon > lon && lon > minLon) {
      inArea = true;
      if (maxLat > lat && lat > minLat)
        $(".lat").addClass("green").removeClass("red");
      if (maxLon > lon && lon > minLon)
        $(".lon").addClass("green").removeClass("red");
    }
  });
  console.log("Area check result:", inArea);
  return inArea;
}

function checkDirection(set, dir) {
  console.log("checkDirection() called", {
    set,
    dir,
  });
  if (set === dir) {
    targetLocation = dir === "towards" ? "東京駅" : "新大阪駅";
    console.log("Direction check result:", true);
    return true;
  }
  console.log("Direction check result:", false);
  return false;
}

function checkAllowedTime(allowedTime, lastRideTime) {
  console.log("checkAllowedTime() called", {
    allowedTime,
    lastRideTime,
  });
  // Convert "YYYY-MM-DD HH:MM:SS" to a Date object
  var rideDate = new Date(lastRideTime.replace(/-/g, "/"));
  return Date.now() - rideDate.getTime() < allowedTime;
}

function checkShinkansenStatus(targetRequired, lat, lon) {
  console.log("checkShinkansenStatus() called", {
    targetRequired,
    lat,
    lon,
  });

  positionHistory.push({
    lat: lat,
    lon: lon,
    timestamp: Date.now(),
  });
  if (positionHistory.length > 5) positionHistory.shift();

  // 🚨 Move direction calculation BEFORE checks
  var direction = "unknown";
  if (positionHistory.length >= 2) {
    var curr = positionHistory[positionHistory.length - 1];
    var prev = positionHistory[positionHistory.length - 2];
    direction =
      curr.lon > prev.lon ? "east" : curr.lon < prev.lon ? "west" : "none";
  }
  var direction_shinkansen =
    direction === "east" ? "up" : direction === "west" ? "down" : "unknown";

  var areaOk = checkArea(lat, lon);
  var speedOk = checkSpeed(speed);
  var targetOk = targetRequired
    ? checkTarget(direction_shinkansen, lat, lon)
    : true;

  console.log("Conditions Real", {
    areaOk,
    speedOk,
    targetOk,
    direction_shinkansen,
  });

  if (areaOk && speedOk && targetOk && positionHistory.length >= 2) {
    localStorage.setItem("speedFlag", true);
    localStorage.setItem("speed", speed);
    localStorage.setItem("flagRegistered", Date.now());
    localStorage.setItem("allowedItem", itemId);

    sessionStorage.setItem("orangeLog_speed", speed);
    sessionStorage.setItem("orangeLog_lat", lat);
    sessionStorage.setItem("orangeLog_lon", lon);
    sessionStorage.setItem("orangeLog_direction", direction_shinkansen);
    sessionStorage.setItem(
      "orangeLog_uniqueId",
      localStorage.getItem("uniqueId")
    );

    requirementMet();
    orangeModule.sendLogToOrange();
    return true;
  } else {
    localStorage.setItem("speedFlag", false);
    localStorage.setItem("speed", speed);
    showCalculating();
    return false;
  }
}

function returnStatus(position) {
  console.log("returnStatus() called", position);
  if (position.coords.speed == null) {
    $(".speed-status").text("位置情報の取得に時間がかかっています。");
    if (!$(".loaderLoaded").length) {
      $(".loaderLoaded").show();
      $(".speed-status").before('<div class="loader loaderLoaded"></div>');
    }
  } else {
    $(".speed-status").text("");
    $(".loaderLoaded").hide();
  }

  speed = mpstokph(position.coords.speed);
  updateSpeedometer(speed);
  $(".speed-text").text(speed);

  var lat = position.coords.latitude;
  var lon = position.coords.longitude;
  var returnStatus = checkShinkansenStatus(targetRequired, lat, lon);

  $(".speedMeter").text(speed);
  $(".lat").text(lat);
  $(".lon").text(lon);

  return returnStatus;
}

function requirementMet() {
  if (watch_id) {
    navigator.geolocation.clearWatch(watch_id);
    watch_id = null;
  }
  console.log("requirementMet() called");
  var surveyId = $("#waiting-card").data("survey");
  showPlayer();
  sessionStorage.setItem("openedSurvey", surveyId);
}

function showPlayer() {
  console.log("player");
  var surveyId = $("#voice-player").data("survey");
  startSurvey(surveyId);
  sessionStorage.setItem("openedSurvey", surveyId);

  console.log("player");
  $("#overlay-card").hide();
  $("#waiting-card").hide();
  $("#voice-player").show().css({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    // justifyContent: "center"
  });
}

function startSurvey(surveyId) {
  if (!surveyAnswered) {
    if (sessionStorage.getItem("openedSurvey") !== surveyId) {
      getSurvey(surveyId);
    }
  }
}

// function startSurvey(surveyId) {
//     console.log("startSurvey() called", surveyId);
//     if (!surveyId) return;

//     var today = new Date();
//     var yyyy = today.getFullYear();
//     var mm = String(today.getMonth() + 1).padStart(2, '0');
//     var dd = String(today.getDate()).padStart(2, '0');
//     var formatToday = yyyy + '-' + mm + '-' + dd;

//     var storedDate = localStorage.getItem(surveyId);
//     if (storedDate !== formatToday && sessionStorage.getItem("openedSurvey") !== surveyId) {
//         getSurvey(surveyId);
//     } else {
//         showLoadingScreen();
//         setTimeout(function () {
//             window.location.href = "/ekimemo3rd/certificate/";
//             hideLoadingScreen();
//         }, 500);
//     }
// }

function showCalculating() {
  console.log("showCalculating() called");
  $("#overlay-card, #voice-player").hide();
  $("#waiting-card").show().css({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  });
}

function mpstokph(mps) {
  var result = (mps * 3.6).toFixed(2);
  console.log("mpstokph() called", mps, result);
  return result;
}

function showError(error) {
  console.log("showError() called", error);
  var messages = {
    1: "位置情報の取得ができませんでした。\n設定により位置情報の取得を許可してください。",
    2: "位置情報が有効ではない端末です。",
    3: "位置情報の取得がタイムアウトしました。",
    default: "不明なエラー",
  };
  showPlayerAlert(messages[error.code] || messages.default);
}

function isInAppBrowser() {
  var ua = navigator.userAgent;
  var result =
    /FBAN|FBAV|FBIOS|FB_IAB|FB4A|Instagram|Twitter|Line|WebView/i.test(ua);
  console.log("isInAppBrowser() called", result);
  return result;
}
