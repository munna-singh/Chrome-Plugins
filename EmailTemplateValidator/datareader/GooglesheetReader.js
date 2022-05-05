/**
 * Sample JavaScript code for sheets.spreadsheets.values.get
 * See instructions for running APIs Explorer code samples locally:
 * https://developers.google.com/explorer-help/code-samples#javascript
 */

class TailFactory {
  constructor(props) {
    this.props = props;
  }

  //   // When the button is clicked, inject setPageBackgroundColor into current page
  // changeColor.addEventListener("click", async () => {
  //     let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  //     chrome.scripting.executeScript({
  //       target: { tabId: tab.id },
  //       function: setPageBackgroundColor,
  //     });
  //   });

  //   // The body of this function will be executed as a content script inside the
  //   // current page
  //   function setPageBackgroundColor() {
  //     chrome.storage.sync.get("color", ({ color }) => {
  //       document.body.style.backgroundColor = color;
  //       document.designMode = "on";
  //     });
  //   }

  //   // Read googlesheet
  //   let auth = document.getElementById("authenticate");

  //   auth.addEventListener("click", async () => {
  //     let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  //     chrome.scripting.executeScript({
  //       target: { tabId: tab.id },
  //       function: authAndLoad,
  //     });
  //   });

  //   function authAndLoad() {
  //     that = this;
  //     return that.gapi.auth2
  //       .getAuthInstance()
  //       .signIn({
  //         scope:
  //           "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/spreadsheets.readonly",
  //       })
  //       .then(
  //         function () {
  //           console.log("Sign-in successful");
  //           that.gapi.client.setApiKey("AIzaSyARdZeXxQ8QmCj9lgW8Kh6fl4KJjE2dZ9w");
  //           return that.gapi.client
  //             .load("https://sheets.googleapis.com/$discovery/rest?version=v4")
  //             .then(
  //               function () {
  //                 console.log("GAPI client loaded for API");
  //               },
  //               function (err) {
  //                 console.error("Error loading GAPI client for API", err);
  //               }
  //             );
  //         },
  //         function (err) {
  //           console.error("Error signing in", err);
  //         }
  //       );
  //   }
  //   function authenticate() {
  //     debugger;
  //   }
  //   function loadClient() {}
  //   // Make sure the client is loaded and sign-in is complete before calling this method.
  //   function execute() {
  //     return gapi.client.sheets.spreadsheets.values
  //       .get({
  //         spreadsheetId: "1yXwScD1tp8gG1t6xwCIBj9qDAbxlhmRxApuaFfFl6Nc",
  //         range: "a1:g30",
  //         access_token: "AIzaSyARdZeXxQ8QmCj9lgW8Kh6fl4KJjE2dZ9w",
  //       })
  //       .then(
  //         function (response) {
  //           // Handle the results here (response.result has the parsed body).
  //           console.log("Response", response);
  //         },
  //         function (err) {
  //           console.error("Execute error", err);
  //         }
  //       );
  //   }
}
