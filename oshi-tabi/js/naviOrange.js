$(document).ready(function () {
  var modal = $("#surveyModal");
  var span = $(".survey-close");
  var submitButton = $("#survey-submit");

  span.click(function () {
    modal.hide();
  });

  $("#survey-submit").click(function (event) {
    submitAnswer();
    showLoadingScreen("アンケートを送信しています。")
  });

  $('.backIcon').click(function () {
    if (localStorage.getItem("eventUrl") != null) {
      var backURL = localStorage.getItem("eventUrl");
      window.location.href = backURL;
    } else {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'https://recommend.jr-central.co.jp/oshi-tabi/';
      }
    }
  });


});

function createDropdownQuestion(parent, questionText, options, questionOrder) {
  var $question = $('<p>').html(questionText);
  parent.append($question);

  var $select = $('<select>', {
    id: 'question-' + questionOrder,
    class: "dropDownSelector",
    css: {
      width: '100%',
      padding: '10px',
      marginBottom: '20px',
      borderRadius: '5px',
      border: '1px solid #ccc'
    }
  });
  parent.append($select);

  // Add a blank option at the start with placeholder text
  var $blankOption = $('<option>', {
    value: '',
    text: '選択してください。',
    selected: true,
    disabled: true
  });
  $select.append($blankOption);

  options.forEach(function (option) {
    var $opt = $('<option>', {
      value: option,
      text: option
    });
    $select.append($opt);
  });

  // Add free writing input for "その他" and hide it by default
  var $textInput = $('<input>', {
    type: 'text',
    class: 'free-write-input',
    css: {
      display: "none",
      width: '100%',
      padding: '10px',
      marginBottom: '20px',
      borderRadius: '5px',
      border: '1px solid #ccc'
    },
    // style: 'display: none; margin-top: 10px;', // Hidden by default
    placeholder: '詳細を入力してください'
  });
  parent.append($textInput);

  // Disable the blank option after a selection is made
  $select.change(function () {
    if ($select.val() === 'その他') {
      $textInput.show().prop('required', true);
    } else {
      $textInput.hide().prop('required', false);
    }
    if ($select.val() !== '') {
      $blankOption.prop('disabled', true);
    }
    checkIfAllAnswered();
  });

  $textInput.on('input', function () {
    checkIfAllAnswered();
  });
}

function createCheckboxQuestion(parent, questionText, options, questionOrder) {
  var $question = $('<p>').text(questionText);
  parent.append($question);

  var $checkboxContainer = $('<div>', {
    id: 'question-' + questionOrder,
    class: "checkboxContainer",
    css: {
      marginBottom: '20px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      padding: '10px'
    }
  });
  parent.append($checkboxContainer);

  options.forEach(function (option) {
    var $label = $('<label>', {
      css: {
        display: 'block',
        margin: '5px 0'
      }
    });

    var $checkbox = $('<input>', {
      type: 'checkbox',
      value: option,
      name: 'question-' + questionOrder
    });

    $label.append($checkbox);
    $label.append(document.createTextNode(' ' + option));
    $checkboxContainer.append($label);
    // If the option is "その他", append an input field
    if (option === "その他") {
      var $textInput = $('<input>', {
        type: 'text',
        class: 'free-write-input',
        css: {
          display: "none",
          width: '100%',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '5px',
          border: '1px solid #ccc'
        },
        placeholder: '詳細を入力してください'
      });
      $label.append($textInput);
      $checkbox.change(function () {
        if ($(this).is(':checked')) {
          $textInput.show().prop('required', true);
        } else {
          $textInput.hide().prop('required', false);
        }
        checkIfAllAnswered();

      });

      $textInput.on('input', function () {
        checkIfAllAnswered();
      });
    }
  });

  // Attach an event listener to check if any checkbox is changed
  $checkboxContainer.find('input[type="checkbox"]').change(function () {
    checkIfAllAnswered();
  });
}

function createFreeWriteInputQuestion(parent, questionText, questionOrder) {
  var $question = $('<p>').html(questionText);
  parent.append($question);

  var $textArea = $('<textarea>', {
    id: 'question-' + questionOrder, // Unique ID based on questionOrder
    class: 'free-write-textbox', // Change the class name
    css: {
      width: '100%',
      height: '150px', // Set the height to allow multiple lines
      padding: '15px',
      marginBottom: '30px',
      borderRadius: '8px',
      border: '2px solid #ccc'
    },
    placeholder: '詳細を入力してください',
    maxlength: 200
  });

  $textArea.on('input', function () {
    var currentChars = this.value.length;
    if (currentChars > 200) {
      this.value = this.value.substring(0, maxChars); // Trim the text if it exceeds the limit
    }
  });

  parent.append($textArea);
}


function checkIfAllAnswered() {
  var allAnswered = true;

  // Check dropdowns
  $(".dropDownSelector").each(function () {
    var selectedOptionValue = $(this).val();
    if (!selectedOptionValue) { // this checks for null, undefined, and empty strings
      allAnswered = false;
      return false; // break out of the .each loop
    }
  });

  // Check checkboxes if all dropdowns were selected
  if (allAnswered) {
    var checkedGroups = {}; // to keep track of checkbox groups that are checked

    $('input[type="checkbox"]').each(function () {
      if ($(this).is(':checked')) {
        checkedGroups[$(this).attr('name')] = true;
      }
    });

    $('input[type="checkbox"]').each(function () {
      var checkboxGroupName = $(this).attr('name');
      if (!checkedGroups[checkboxGroupName]) {
        allAnswered = false;
        return false; // break out of the .each loop
      }
    });
  }

  // Check for required free-write-input fields
  $(".free-write-input:visible").each(function () {
    if (!$(this).val().trim()) {
      allAnswered = false;
      return false; // break out of the .each loop
    }
  });

  // Enable or disable the submit button
  if (allAnswered) {
    console.log("allAnsweredTrue");
    $("#survey-submit").prop('disabled', false);

  } else {
    console.log("allAnsweredFalse");
    $("#survey-submit").prop('disabled', true);
  }
}



function submitAnswer() {
  $("#surveyModal").hide();
  var uniqueId = localStorage.getItem("uniqueId");
  var uniqueIdFromCookie = getCookie("uniqueId");
  if (uniqueId != uniqueIdFromCookie) {
    uniqueId = uniqueIdFromCookie;
  }
  if ($("#voice-player").data("survey")) {
    var surveyId = $("#voice-player").data("survey");
  }
  if ($("#voice-player").data("survey")) {
    var surveyId = $("#voice-player").data("survey");
  }

  if ($("#surveyModal").data("survey")) {
    var surveyId = $("#surveyModal").data("survey");
  }

  if ($(".quizScreen").data("survey")) {
    var surveyId = $(".quizScreen").data("survey");
  }

  var answers = {}; // Initialize as an empty object

  $(".dropDownSelector").each(function () {
    var fullId = $(this).attr('id');
    var selectedOptionValue = $(this).val();
    var id = fullId.split("-")[1]; // Extract the question id
    // Check if "その他" is selected and capture the corresponding free-write input
    if (selectedOptionValue === "その他" || selectedOptionValue === "その他（定期券等）") {
      var freeWriteInput = $(this).nextAll('.free-write-input:first');
      var freeWriteValue = freeWriteInput.val();
      console.log(freeWriteValue);
      if (freeWriteValue) {
        selectedOptionValue += ': ' + freeWriteValue;
      }
    }
    answers[id] = selectedOptionValue; // Set the property on the answers object
  });

  // Checkbox answers
  var checkedGroups = {}; // Keeps track of which checkboxes are checked for each group
  $('input[type="checkbox"]:checked').each(function () {
    var fullId = $(this).attr('name'); // Assuming the name attribute is used to group checkboxes
    var checkboxValue = $(this).val();
    var id = fullId.split("-")[1]; // Extract the question id

    // If the checked value is "その他", capture the corresponding free-write input
    if (checkboxValue === "その他") {
      // var freeWriteValue = $(this).siblings('.free-write-input').val();
      var freeWriteInput = $(this).nextAll('.free-write-input:first');
      var freeWriteValue = freeWriteInput.val();
      if (freeWriteValue) {
        checkboxValue += ': ' + freeWriteValue;
      }
    }


    // Initialize the answer array for this group if not yet initialized
    if (!checkedGroups[id]) {
      checkedGroups[id] = [];
    }

    checkedGroups[id].push(checkboxValue);
  });

  $('.free-write-textbox').each(function () {
    var fullId = $(this).attr('id');
    var freeWriteValue = $(this).val();
    var id = fullId.split("-")[1]; // Extract the question id

    if (freeWriteValue) {
      answers[id] = '自由回答: ' + freeWriteValue;
    } else {
      answers[id] = '自由回答: ' + '記入なし';
    }
  });

  // Add the checkbox answers to the main answers object
  for (var id in checkedGroups) {
    answers[id] = checkedGroups[id];
  }
  if (getCookie("oshitabi") != "") {
    var token = getCookie("oshitabi");
    submitAnswerWithAccountId(surveyId, answers);
  } else {
    submitAnswerWithUniqueId(surveyId, uniqueId, answers);
  }
}

function submitAnswerWithAccountId(surveyId, answers) {
  var token = getCookie("oshitabi");

  var url = API_SERVER + "/api_oshitabi/admin/submitAnswerWithAccountId.php";
  var requestJson = {
    "key": API_KEY,
    "secret": API_SECRET,
    "surveyId": surveyId,
    "js": true,
    "answers": answers
  };

  console.log(requestJson);
  $.when(ajaxRequest(url, requestJson, token)).done(function () {

    if (arguments[0].return.name) {
      sessionStorage.removeItem("openedSurvey");
      if (localStorage.getItem("surveySettings")) {
        var surveySettings = JSON.parse(localStorage.getItem("surveySettings"));
        var createCertificateFlag = surveySettings.createCertificate;
        var redirectUrl = surveySettings.redirectUrl;
        var certificateEvent = surveySettings.certificateEvent;
        if (certificateEvent) {
          var eventId = certificateEvent;
          sessionStorage.setItem("oshitabi-coupon-event", eventId);
        } else {
          var eventId = localStorage.getItem("oshitabi-event");
        }
        if (redirectUrl != "") {
          location.href = redirectUrl;
        }
      }

      setLocalSurvey(arguments[0].return.surveyId, arguments[0].return.name);
      setTimeout(() => {
        hideLoadingScreen();
      }, "1000");
    }
  });
}

function submitAnswerWithUniqueId(surveyId, uniqueId, answers) {
  var url = API_SERVER + "/api_oshitabi/admin/submitAnswer.php";
  var requestJson = {
    "key": API_KEY,
    "secret": API_SECRET,
    "surveyId": surveyId,
    "uniqueId": uniqueId,
    "js": true,
    "answers": answers
  };

  console.log(requestJson);
  $.when(ajaxRequest(url, requestJson)).done(function () {

    if (arguments[0].return.name) {
      sessionStorage.removeItem("openedSurvey");
      if (localStorage.getItem("surveySettings")) {
        var surveySettings = JSON.parse(localStorage.getItem("surveySettings"));
        var createCertificateFlag = surveySettings.createCertificate;
        var redirectUrl = surveySettings.redirectUrl;
        if (redirectUrl != "" && createCertificateFlag == false && surveyId != "65a6c5f03e418662f70191c4") {
          location.href = redirectUrl;
        } else if (createCertificateFlag) {
          if (surveyId == "660453e88f6492b8678a280e") {
            createKusuriyaCoupon(surveySettings.redirectUrl, surveySettings.certificateValidDate, surveySettings.refreshCertificate, surveySettings.limit, surveySettings.lastDate);
          } else if (redirectUrl != "") {
            createCoupon(surveySettings.redirectUrl, surveySettings.certificateValidDate, surveySettings.refreshCertificate, surveySettings.limit, surveySettings.lastDate);
          } else if (redirectUrl == "") {
            createCouponNoRedirect(surveySettings.certificateEvent, surveySettings.certificateValidDate, surveySettings.refreshCertificate, surveySettings.limit, surveySettings.lastDate);
          }
        }
      }

      setLocalSurvey(arguments[0].return.surveyId, arguments[0].return.name);
      setTimeout(() => {
        hideLoadingScreen();
      }, "1000");
    }
  });
}


function createCouponWithAccountId(returnUrl, date, refresh, limit, lastDate, certificateEvent) {
  console.log("createCouponCalled");
  var uniqueIdFromCookie = getCookie("uniqueId");
  if (uniqueId != uniqueIdFromCookie) {
    uniqueId = uniqueIdFromCookie;
  }
  var eventId = localStorage.getItem("oshitabi-event");
  if (certificateEvent) {
    var eventId = certificateEvent;
  }
  var url = API_SERVER + "/api_oshitabi/event/createCouponWithAccountId.php";

  var requestJson = {
    "key": API_KEY,
    "secret": API_SECRET,
    "js": true,
    "uniqueId": uniqueId,
    "eventId": eventId,
    "timeout": date,
    "refresh": refresh,
    "limit": limit,
    "lastDate": lastDate
  };
  //ajaxRequest("loginInfo",url, requestJson);
  $.when(ajaxRequest(url, requestJson, token)).done(function () {
    console.log(JSON.stringify(arguments[0]));
    if (arguments[0].return) {
      localStorage.setItem("couponId", arguments[0].return.couponId);
      localStorage.setItem(eventId + "-couponId", arguments[0].return.couponId);
      sessionStorage.removeItem("oshitabi-coupon-event");
      createCookie("couponId", arguments[0].return.couponId, 60 * 60 * 24 * date);
      if (returnUrl != "" && eventId == "65c4fedb3e41861d446be714") {
        location.href = returnUrl;
      } else if (eventId == "65e578ff564540d3ed95fbf9") {

      } else {
        location.href = returnUrl + "/" + arguments[0].return.couponId;
      }
    }
  });
}


function setLocalSurvey(id, name) {
  $("#surveyModal").hide();

  let today = new Date();
  let yyyy = today.getFullYear();
  let mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed in JavaScript.
  let dd = String(today.getDate()).padStart(2, '0');

  let formattedDate = `${yyyy}-${mm}-${dd}`;

  localStorage.setItem(id, formattedDate);
}



function getSurvey(id) {
  showLoadingScreen();
  var url = API_SERVER + "/api_oshitabi/admin/getSurvey.php";

  let data = {
    key: API_KEY,
    secret: API_SECRET,
    js: true,
    surveyId: id
  };

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(data => {
      // Open the survey with the fetched questions data
      // localStorage.setItem("surveyId",id);
      if (data.return.settings.buttonText) {
        $("#survey-submit").text(data.return.settings.buttonText);
      }
      openSurvey(data.return, id);
      hideLoadingScreen();
      console.log(data.return)

      localStorage.setItem("surveySettings", JSON.stringify(data.return.settings));

      // localStorage.setItem("surveySettings",data.return.settings);

    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

function openSurvey(surveyData, id) {
  var $surveyModal = $("#surveyModal");
  $("#surveyModal").data("survey", id);
  $("#surveyModal").attr('data-survey', id);

  var $surveyForm = $("#survey-form");
  var $submitButton = $("#survey-submit");


  $surveyModal.show(); // Show the overlay
  // $submitButton.disabled = true;
  $("#survey-submit").prop('disabled', true);

  $(".survey-close").click(function () {
    $surveyModal.hide(); // Hide the overlay
  });
  $surveyForm.empty();
  surveyData.questions.forEach(function (question) {
    if (question.type == "pull-down") {
      createDropdownQuestion($surveyForm, question.text, question.choices, question.unique);
      console.log("type:pull-down")
    } else if (question.type == "check-box") {
      createCheckboxQuestion($surveyForm, question.text, question.choices, question.unique);
      console.log("type:check-box")
    } else if (question.type == "free-write-input") {
      console.log("type:free-write-input")
      createFreeWriteInputQuestion($surveyForm, question.text, question.unique);
    } else {
      createDropdownQuestion($surveyForm, question.text, question.choices, question.unique);
    }

  });
  hideLoadingScreen();
}


$("#locationHelp").click(function () {
  window.open("/pdf/help_location.pdf");
});


$("#backToEventTop").click(function () {
  var url = $(this).data("url");
  window.location.href = url;
});


$("#contact").click(function () {
  window.location.href = "/contact";
});


$(document).ready(function () {
  // Open the menu when the hamburger button is clicked
  $('.menuBar').click(function () {
    var currentURLWithoutParameters = window.location.href.split('?')[0];

    sessionStorage.setItem("backPage", currentURLWithoutParameters);
    localStorage.setItem("backtoEvent", currentURLWithoutParameters);
    $('#navLinks').addClass('open');
  });

  // Close the menu when the close button is clicked
  $('#close-btn').click(function () {
    $('#navLinks').removeClass('open');
  });
});




//for scroll
let scrollUrl = new URL(window.location.href);
if (!window.location.href.includes("player")) {
  let previousScrollPosition = window.pageYOffset;
  window.onscroll = function () {
    let currentScrollPosition = window.pageYOffset;
    if (previousScrollPosition > currentScrollPosition || currentScrollPosition <= 0) {
      document.getElementById("mainHeader").style.top = "0";
    } else {
      document.getElementById("mainHeader").style.top = "-55px";
    }
    previousScrollPosition = currentScrollPosition;
  }
}



//for alert
document.addEventListener("DOMContentLoaded", function () {
  var modal = document.getElementById("alertModal");
  modal.style.display = "none";
});

function showAlert(main, sub) {
  var modal = document.getElementById("alertModal");
  modal.style.display = "flex";

  var title = document.getElementById("alertTitle");
  title.innerHTML = main;

  var message = document.getElementById("alertMessage");
  message.innerHTML = sub;
}

function closeAlert() {
  var modal = document.getElementById("alertModal");
  modal.style.display = "none";
}

//for loading
function showLoadingScreen(message = "ロード中・・・") {
  loadingText.textContent = message;
  loadingScreen.style.display = 'flex';
}

function hideLoadingScreen() {
  loadingScreen.style.display = 'none';
}

$(document).ready(function () {
  var eventId = localStorage.getItem("oshitabi-event");
  if (getCookie("oshitabi")) {
  }
  if (localStorage.getItem("uniqueUpdated")) {
    var updatedDate = localStorage.getItem("uniqueUpdated");
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed in JavaScript.
    var dd = String(today.getDate()).padStart(2, '0');

    let formatToday = `${yyyy}-${mm}-${dd}`;
    if (updatedDate != formatToday) {
      if (getCookie("oshitabi")) {
        loginCheck();
      }

    }
  } else {
    if (getCookie("oshitabi")) {
      loginCheck();
    }
  }

  function loginCheck() {
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
});