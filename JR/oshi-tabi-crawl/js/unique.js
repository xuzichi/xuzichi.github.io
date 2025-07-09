// Function to generate a unique ID
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Function to get or set the unique ID in local storage
function getOrSetUniqueId() {
  // Check if the unique ID is already stored in local storage
  const uniqueIdKey = 'uniqueId';
  let uniqueId = localStorage.getItem(uniqueIdKey);
  createCookie(uniqueIdKey, uniqueId, 60 * 60 * 24 * 365);

  // If the unique ID is not in local storage, generate one and store it
  if (!uniqueId) {
    if (getCookie("oshitabi")) {
      getUniqueFromLogin();
    } else {
      uniqueId = generateUniqueId();
      localStorage.setItem(uniqueIdKey, uniqueId);
      createCookie(uniqueIdKey, uniqueId, 60 * 60 * 24 * 365);
      tempRegister(uniqueId);
    }
  }

  return uniqueId;
}

function tempRegister(uniqueId) {

  var url = API_SERVER + "/api_oshitabi/account/tempRegister.php";
  var requestJson = {
    "key": API_KEY,
    "secret": API_SECRET,
    "uniqueId": uniqueId,
    "js": true
  };
  //ajaxRequest("loginInfo",url, requestJson);
  $.when(ajaxRequest(url, requestJson)).done(function () {
    console.log(JSON.stringify(arguments[0]));
    if (arguments[0].token) {
    }
  });
}

function getUniqueFromLogin() {
  var token = getCookie("oshitabi");
  var url = API_SERVER + "/api_oshitabi/account/loginCheck.php";
  var requestJson = {
    "key": API_KEY,
    "secret": API_SECRET,
    "js": true
  };
  //ajaxRequest("loginInfo",url, requestJson);
  $.when(ajaxRequest(url, requestJson, token)).done(function () {
    console.log(JSON.stringify(arguments[0]));
    if (arguments[0].loginCheck) {
      var uniqueId = arguments[0].loginCheck.uniqueId;
      localStorage.setItem("uniqueId", uniqueId);
      createCookie("uniqueId", uniqueId, 60 * 60 * 24 * 365);

      let today = new Date();
      let yyyy = today.getFullYear();
      let mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed in JavaScript.
      let dd = String(today.getDate()).padStart(2, '0');

      let formattedDate = `${yyyy}-${mm}-${dd}`;

      localStorage.setItem("uniqueUpdated", formattedDate);
    }
  });
}

// Get or set the unique ID in local storage

$(document).ready(function () {
  getOrSetUniqueId();
});
//   console.log('Unique ID:', uniqueId);
