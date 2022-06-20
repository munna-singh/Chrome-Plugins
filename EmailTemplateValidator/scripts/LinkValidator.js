linkValidator.addEventListener("click", async () => {
  // Get the in progress text
  document.getElementById("validationinprogress").innerHTML =
    "Validation is in progress ...";
  linkValidator.disabled = true;
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: ValidateHrefLinks,
  });
});

function ValidateHrefLinks() {
  //Get validation result span
  var spanResult = document.getElementById("validationResult");
  var urls = {};
  var req_params = [];
  var links = document.querySelectorAll("a");
  links.forEach((link) => {
    const val = link.getAttribute("href");
    if (val !== "#" && val !== "" && val !== "/" && val != null && !val.startsWith("javascript" && !val.startsWith("#") && !val.startsWith("mailto" && !val.startsWith("tel")))) {
      req_params.push(link.href);
      var oneurl = {
        text: link.innerText,
        link: link.href,
        redirectlink: "",
      };
      urls[link.href] = oneurl;
    }
  });

  var formatted_payload = {
    urls: req_params,
  };
  if (req_params.length > 0) {
    $.ajax({
      type: "POST",
      url: "https://rah4lzwrhowyyfvije4lxrcgty0hnvoj.lambda-url.us-west-2.on.aws/",
      data: JSON.stringify(formatted_payload),
      success: function (res) {
        var csv = "Link_Text,Original_Link, Resp_Code, Redirect_url\n";
        res.forEach(function (row) {
          csv += `${urls[row.source_url].text
            .replaceAll(",", " ")
            .trim()},"${row.source_url.trim().replaceAll('#','<hash>')}",${row.response_code},${
            row.redirect_url
          }\n`;
        });

        var hiddenElement = document.createElement("a");
        hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
        hiddenElement.target = "_blank";
        hiddenElement.download = "Link_Validation_Report.csv";
        hiddenElement.click();
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        alert(
          "Unable to fullfill the request right now. Please try after some time."
        );
      },
      contentType: "text/plain; charset=UTF-8",
      async: false,
    });
  }
}

linkValidatorSwitch.addEventListener('change', function () {
  chrome.storage.sync.set({ValidateLinkSwitch: linkValidatorSwitch.checked}, function() {
    console.log('ValidateLinkSwitch value is set.');
  });  
});