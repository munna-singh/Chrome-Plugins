validateTag.addEventListener("click", async () => {
  // console.log(CSV_COLUMNS);
  validateOptionsCtrl = document.getElementById("match_options"); // validate options control
  // console.log(validateOptionsCtrl.value);
  var srcFile = document.getElementById("src-lcaol-file");
  var ctrlToValidate = document.querySelectorAll(".ctrl-chkbox:checked");
  var ignoreNestedCtrl = document.getElementById(
    "ignore-anchro-inside-ctrls"
  ).checked;

  if (ctrlToValidate.length === 0) {
    document.getElementById("validationError").innerHTML =
      "At least one control should be selected";
    alert("At least one control should be selected");
    return;
  }
  var seletedCtrls = [];
  for (var i = 0; i < ctrlToValidate.length; i++) {
    seletedCtrls.push(ctrlToValidate[i].name);
  }
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (srcFile.files && srcFile.files[0]) {
    var sourceFile = srcFile.files[0];
    if (sourceFile) {
      var reader = new FileReader();
      reader.addEventListener("load", function (e) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: ValidateNode,
          args: [
            e.target.result,
            seletedCtrls,
            ignoreNestedCtrl,
            validateOptionsCtrl.value,
          ],
        });
      });
      reader.readAsText(sourceFile, "UTF-8");
    }
  } else {
    document.getElementById("validationError").innerHTML =
      "Please select the source file.";
    alert("Please select the source file.");
  }
});

function ValidateNode(
  sourceFileData,
  ctrls,
  ignoreNestedCtrl,
  validateOptionsCtrlValue
) {
  if (!sourceFileData) {
    return;
  }

  // clearPreviousErrors();
  //Clear previous error message by removing the class
  var errorCtrls = document.querySelectorAll(".gale-validation-error-box");
  for (y = 0; y < errorCtrls.length; y++) {
    errorCtrls[y].classList.remove("gale-validation-error-box");
  }

  console.log(`Validation by - ${validateOptionsCtrlValue}`);
  if (validateOptionsCtrlValue == "id") {
    var errorCtrls = [];
    let allRows = sourceFileData.split(/\r?\n|\r/);

    //Filter data
    // console.log(CSV_COLUMNS);
    let filteredSourceRow = [];
    for (x = 1; x < allRows.length; x++) {
      let splited = allRows[x].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      // console.log(splited);
      if (splited[1]) {
        filteredSourceRow.push(splited);
      }
    }

    for (i = 0; i < filteredSourceRow.length; i++) {
      // console.log(filteredSourceRow[i])
      var ctrlId_Csv = filteredSourceRow[i][1];
      var ctrlText_Csv = filteredSourceRow[i][2].replaceAll('"', "");
      var controlDoc = document.getElementById(ctrlId_Csv);
      if (!controlDoc) {
        continue;
      }

      ctrlName = controlDoc.tagName;
      ctrlId = controlDoc.getAttribute("Id");

      ctlvalue = controlDoc.outerText;
      ctlvalue = ctlvalue.replaceAll('"', "");
      ctlvalue = ctlvalue.replace(/\u00a0/g, " ");
      ctlvalue = ctlvalue.replace(/\u200C/g, "");
      ctlvalue = ctlvalue.trim();

      var source = "";
      if (ctrlName === "A") {
        source = controlDoc.getAttribute("href");
      } else if (ctrlName === "IMG") {
        source = controlDoc.getAttribute("src");
      }
      if (source === "#" || source === null) {
        source = "";
      }

      let altText = controlDoc.getAttribute("alt");
      if (altText === undefined || altText === null) {
        altText = "";
      }

      combinedData =
        ctrlName + "," + ctrlId + "," + ctlvalue + "," + source + "," + altText;

      filteredSourceRow[i][2] = filteredSourceRow[i][2].replaceAll('"', "");
      var combinedCsvRow = filteredSourceRow[i].join(",");

      // console.log(ctrlText_Csv);
      if (combinedData !== combinedCsvRow) {
        console.log(
          `Mismatch content:> Row No - ${i + 1}---> \n ${combinedCsvRow}`
        );
        controlDoc.classList.add("gale-validation-error-box");
        errorCtrls.push(controlDoc);
      }
    }
  } else {
    let allRows = sourceFileData.split(/\r?\n|\r/);
    //Filter data
    let filteredSourceRow = [];
    for (x = 1; x < allRows.length; x++) {
      let splited = allRows[x].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      // console.log(splited);
      if (
        splited.length == 5 &&
        ctrls.find(
          (element) => element.toUpperCase() == splited[0].toUpperCase()
        )
      ) {
        // console.log(splited);
        filteredSourceRow.push(splited);
      }
    }

    var nodes = document.querySelectorAll(ctrls.join(","));
    var filteredNode = [];
    for (i = 0; i < nodes.length; i++) {
      if (ignoreNestedCtrl) {
        const parentNode = nodes[i].parentNode.nodeName;
        if (!parentNode.startsWith("H") && !parentNode.startsWith("P")) {
          filteredNode.push(nodes[i]);
        }
      } else {
        filteredNode.push(nodes[i]);
      }
    }
    if (filteredSourceRow.length !== nodes.length) {
      alert(
        "Source column count(" +
          filteredSourceRow.length +
          ") and page control count(" +
          nodes.length +
          ") does not match."
      );
      return;
    }

    var errorCtrls = [];
    for (i = 0; i < filteredSourceRow.length; i++) {
      var nodeName = filteredNode[i].nodeName;
      var source = null;

      if (nodeName === "A") {
        source = nodes[i].getAttribute("href");
      } else if (nodeName === "IMG") {
        source = nodes[i].getAttribute("src");
      }
      if (source === "#" || source === null) {
        source = "";
      }
      let ctlId = filteredNode[i].getAttribute("Id");
      if (ctlId === undefined || ctlId === null) {
        ctlId = "";
      }

      let ctrlText = filteredNode[i].innerText;
      if (
        filteredNode[i].innerText === undefined ||
        filteredNode[i].innerText === null
      ) {
        ctrlText = "";
      } else {
        ctrlText = ctrlText.replaceAll('"', "");
        ctrlText = ctrlText.replace(/\u00a0/g, " ");
        ctrlText = ctrlText.replace(/\u200C/g, "");
        ctrlText = ctrlText.trim();
      }

      let altText = filteredNode[i].getAttribute("alt");
      if (
        filteredNode[i].getAttribute("alt") === undefined ||
        filteredNode[i].getAttribute("alt") === null
      ) {
        altText = "";
      }

      let compareString =
        nodeName + "," + ctlId + "," + ctrlText + "," + source + "," + altText;

      // Replace if any double quotes present on value text
      filteredSourceRow[i][2] = filteredSourceRow[i][2].replaceAll('"', "");
      var combinedCsvRow = filteredSourceRow[i].join(",");

      if (combinedCsvRow !== compareString) {
        console.log(`Mismatch content:> Row No - ${i + 1}---> \n`);
        console.log(combinedCsvRow);
        filteredNode[i].classList.add("gale-validation-error-box");
        errorCtrls.push(filteredNode[i]);
      }
    }
  }

  if (errorCtrls.length === 0) {
    alert("HTML CONTENT:: Validation successful. No discrepancy detected!!!");
  } else {
    alert(
      "HTML CONTENT:: Validation error. Please check console log for list of controls which has issue"
    );
    // console.log(errorCtrls);
    // create a style element
    const style = document.createElement("style");

    // add the CSS as a string using template literals
    style.appendChild(
      document.createTextNode(`
    .gale-validation-error-box { 
      border-radius: 2px !important;
      border-color: red !important;
      border-width: 5px !important;
      border-style: solid !important;
    }`)
    );

    // add it to the head
    const head = document.getElementsByTagName("head")[0];
    head.appendChild(style);
  }
}

contentCheckSwitch.addEventListener('change', function () {
  chrome.storage.sync.set({ContentValidationSwitch: contentCheckSwitch.checked}, function() {
    console.log('ContentValidationSwitch value is set.');
  });  
});

//ignoreFullURL
ignoreFullURL.addEventListener('change', function () {
  chrome.storage.sync.set({IgnoreFullURL: ignoreFullURL.checked}, function() {
    console.log('IgnoreFullURL value is set.');
  });  
});

contentValidationChks.forEach(el => el.addEventListener('change', event => {
  debugger;
  //let varName = el.name;
  chrome.storage.sync.set({["contentValChk-" + el.name]: el.checked}, function() {
    console.log('ContentValidationSwitch value is set.');
  }); 
}));

