// Client ID and API key from the Developer Console
var CLIENT_ID = '19798527682-v5cu75u3b7499sk3u027926nps5br8l4.apps.googleusercontent.com';
var API_KEY = 'AIzaSyCL7rRqEs2ol_KD8wzFiX0CoOZ5ZIIdP4g';
// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets";


var SPREADSHEET_ID = '1YY9dLjVEgaYl9HAvre1MvUHQUyxsGjNoKgAxYIRAaIA';
// Range names ...
var ranges = [
  'Form Responses 1!B:B', //first name
  'Form Responses 1!C:C', //last name
  'Form Responses 1!D:D'  //phone number
];

var SPREADSHEET_ATTN = '16pJeS9ADQ_aCkWni8WREvP3tIRNkoAVK0N4K-l5MCmo';

var authorizeButton = document.getElementById('authorize-button');
var signoutButton = document.getElementById('signout-button');
var updateAttn = document.getElementById('update-attn');
var updateMaster = document.getElementById('update-master');
var submitButton = document.getElementById('submit-button');
var attnText = document.getElementById('attn_ID');
var sheetText = document.getElementById('sheet_ID');
var users = [];
attnText.placeholder = SPREADSHEET_ATTN;
sheetText.placeholder = SPREADSHEET_ID;
document.getElementById("name").addEventListener("keyup", function(event){
  if (event.keyCode === 13) {
    submitButton.click();
  }
});
/**
*  On load, called to load the auth2 library and API client library.
*/
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
*  Initializes the API client library and sets up sign-in state
*  listeners.
*/
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
    submitButton.onclick = handleSubmitClick;
    updateAttn.onclick = handleUpdateAttnClick;
    updateMaster.onclick = handleUpdateMasterClick;
  });
}

/**
*  Called when the signed in status changes, to update the UI
*  appropriately. After a sign-in, the API is called.
*/
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    document.getElementById('contents').style.display = 'block';
    signoutButton.style.display = 'block';
    submitButton.style.display = 'inline-block';
    getNames();
  } else {
    authorizeButton.style.display = 'block';
    document.getElementById('contents').style.display = 'none';
    signoutButton.style.display = 'none';
  }
}

/**
*  Sign in the user upon button click.
*/
function handleAuthClick(event) {
  users = [];
  $('#members').empty();
  var table = document.getElementById('members');
  var row = '<tr><th>First Name</th><th>Last Name</th><th>Phone Number</th></tr>';
  table.innerHTML += row;
  gapi.auth2.getAuthInstance().signIn();
}

/**
*  Sign out the user upon button click.
*/
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

function handleSubmitClick(event) {
  updateSheet();
}


function updateAttendance(sheet_ID){
  SPREADSHEET_ATTN = getIdFromUrl(sheet_ID);
  alert("Updated!");
}

function updateM(sheet_ID){
  SPREADSHEET_ID = getIdFromUrl(sheet_ID);
  alert("Updated!");
}

function handleUpdateAttnClick(event) {
  var conf = confirm("Update check-in sheet?");
  if(conf == true){
    attnText.placeholder = attnText.value;
    updateAttendance(attnText.value);
    attnText.value = "";
  }
}
function handleUpdateMasterClick(event) {
  var conf = confirm("Update master sheet?");
  if(conf == true){
    sheetText.placeholder = sheetText.value;
    updateM(sheetText.value);
    sheetText.value = "";
  }
}

//Allows user to put in full url of google sheet
function getIdFromUrl(url) { return url.match(/[-\w]{25,}/); }

function updateSheet() {
  console.log(SPREADSHEET_ATTN);
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ATTN,
    range: 'A:A'
  }).then((response) => {
    var result = response.result;
    var numRows = result.values ? result.values.length + 1: 1;
    console.log(`${numRows} rows retrieved.`);

    var range = "A" + numRows + ":D" + numRows; //TODO change the range
    console.log("Range: " + range);
    write(range)

  });
}


function write(range){
  console.log('NAME VALUE' + document.getElementById('name').value);
  if(document.getElementById('name').value == ""){
    alert("Please enter a name");
    return;
  };

  gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ATTN,
    range: range,
    valueInputOption: 'USER_ENTERED',
    values: [[Date(), document.getElementById('name').value]]
  }).then(function(response) {
    alert("Checked in!");
    console.log(response);
  });
}
/**
* Append a pre element to the body containing the given message
* as its text node. Used to display the results of the API call.
*
* @param {string} message Text to be placed in pre element.
*/
function appendPre(message) {
  var pre = document.getElementById('content');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}

/** Fills table with appropriate data from the spreadsheet of names"
*/
function fillTable(first, last, phone) {
  var table = document.getElementById('members');
  var row = '<tr><td>'+first+'</td><td>'+last+'</td><td>'+phone+'</td></tr>';
  table.innerHTML += row;
}

function parseResult(result){
  first = result.valueRanges[0].values.map(String);
  last = result.valueRanges[1].values.map(String);
  phone = result.valueRanges[2].values.map(String);

  for (i = 1; i < first.length; i++){
      users.push({value:first[i] + " " + last[i], first:first[i], last:last[i], phone:phone[i]});
      fillTable(users[i-1].first, users[i-1].last, users[i-1].phone);
  }
  console.log(users);

  $( "#name" ).autocomplete({
    source: function(request, response){
      var matcher = new RegExp( $.ui.autocomplete.escapeRegex( request.term ), "i" );
      response($.grep(users, function(value) {
          return matcher.test(value.first) || matcher.test(value.last) || matcher.test(value.phone);
      }));
    }
  });
}

function getNames(){
  gapi.client.sheets.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges: ranges
  }).then((response) => {
    var result = response.result;
    parseResult(result);
  });

}

/**
* Print the names and majors of students in a sample spreadsheet:
* https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
*/
function listNames() {
      console.log(users.length);
  for(i = 1; i < users.length; i++){
    console.log(users.length);
  }
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Form Responses 1!B:D',
  }).then(function(response) {
    var range = response.result;
    if (range.values.length > 0) {
      appendPre('Status: GOOD');
      for (i = 1; i < range.values.length; i++) {
        var row = range.values[i];
        // Print columns A and E, which correspond to indices 0 and 4.
        var first = row[0];
        var last = row[1];
        var phone = row[2];
        //appendPre(row[0] + ', ' + row[1] + ', ' + row[2]);
        fillTable(first, last, phone);
      }
    } else {
      appendPre('No data found.');
    }
  }, function(response) {
    appendPre('Error: ' + response.result.error.message);
  });
}
