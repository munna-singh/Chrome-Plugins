validateTag.addEventListener("click", async () => {
  // console.log(CSV_COLUMNS);
  validateOptionsCtrl = document.getElementById("match_options"); // validate options control
  // console.log(validateOptionsCtrl.value);
  var srcFile = document.getElementById("src-lcaol-file");
  var ctrlToValidate = document.querySelectorAll(".ctrl-chkbox:checked");
  var ignoreNestedCtrl = ignoreNestedCtrlChk.checked;
  var ignoreQueryString = ignoreFullURL.checked;

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
            ignoreQueryString,
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

this.ValidateNode = function (
  sourceFileData,
  ctrls,
  ignoreNestedCtrl,
  validateOptionsCtrlValue,
  ignoreQueryString
) {
  if (!sourceFileData) {
    return;
  }

  var getFilteredSourceData = function (sourceFileData) {
    let allRows = sourceFileData.split(/\r?\n|\r/);
    //Filter data
    let filteredSourceRow = [];
    for (x = 1; x < allRows.length; x++) {
      let splited = allRows[x].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      if (
        splited.length == 6 &&
        ctrls.find(
          (element) => element.toUpperCase() == splited[0].toUpperCase()
        )
      ) {
        filteredSourceRow.push(splited);
      }
    }
    return filteredSourceRow;
  };
  var valCleaner = function(value){
    if(value === undefined || value === null){
      return "";
    }
    var ctlvalue = value.replace(/"/g, '""');
    ctlvalue = '"' + ctlvalue + '"';
    ctlvalue = ctlvalue.replace(/\u00a0/g, " ");
    ctlvalue = ctlvalue.replace(/\u200C/g, "");
    ctlvalue = ctlvalue.trim();
    return ctlvalue;
  };

  var compareSourceWithDestination = function (
    nodeName,
    node,
    filteredNode,
    filteredSourceRow
  ) {
    if (nodeName === "A") {
      source = node.getAttribute("href");
      if (ignoreQueryString && source.indexOf("?") > 0) {
        source = source.substring(0, source.indexOf("?"));
      }
    } else if (nodeName === "IMG") {
      source = node.getAttribute("src");
    }
    if (source === "#" || source === null) {
      source = "";
    }
    let ctlId = valCleaner(filteredNode.getAttribute("Id")).replaceAll('"', "");
    let ctrlText = valCleaner(filteredNode.innerText);
    let altText = valCleaner(filteredNode.getAttribute("alt"));
    let aliasText = valCleaner(filteredNode.getAttribute("alias"));

    let compareString =
      nodeName + "," + ctlId + "," + ctrlText + "," + aliasText + "," + source + "," + altText;

    // Replace if any double quotes present on value & alias text
    //filteredSourceRow[2] = filteredSourceRow[2].replaceAll('"', "");
    //filteredSourceRow[3] = filteredSourceRow[3].replaceAll('"', "");

    
    if (
      filteredSourceRow[0] === "A" &&
      ignoreQueryString &&
      filteredSourceRow[4].indexOf("?") > 0
    ) {
      filteredSourceRow[4] = filteredSourceRow[4].substring(
        0,
        filteredSourceRow[4].indexOf("?")
      );
    }
    var combinedCsvRow = filteredSourceRow.join(",");

    if (combinedCsvRow !== compareString) {
      console.log(`Mismatch content:> Row No - ${i + 1}---> \n`);
      console.log('File: ' + combinedCsvRow);
      console.log('Page: ' + compareString);
      filteredNode.classList.add("gale-validation-error-box");
      return filteredNode;
    }
    return null;
  };

  debugger;
  // clearPreviousErrors();
  //Clear previous error message by removing the class
  var errorCtrls = document.querySelectorAll(".gale-validation-error-box");
  for (y = 0; y < errorCtrls.length; y++) {
    errorCtrls[y].classList.remove("gale-validation-error-box");
  }

  var errorCtrls = [];
  console.log(`Validation by - ${validateOptionsCtrlValue}`);
  if (validateOptionsCtrlValue == "id") {
    let filteredSourceRow = getFilteredSourceData(sourceFileData);

    for (i = 0; i < filteredSourceRow.length; i++) {
      var ctrlId_Csv = filteredSourceRow[i][1];
      var controlDoc = document.getElementById(ctrlId_Csv);
      if (!controlDoc) {
        continue;
      }

      ctrlName = controlDoc.tagName;
      var fNode = compareSourceWithDestination(ctrlName,controlDoc,controlDoc,filteredSourceRow[i]);
      if (fNode){
        errorCtrls.push(fNode);
      }
    }
  } else {
    //Sequential match
    let filteredSourceRow = getFilteredSourceData(sourceFileData);

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

    for (i = 0; i < filteredSourceRow.length; i++) {
      var nodeName = filteredNode[i].nodeName;
      var fNode = compareSourceWithDestination(nodeName,nodes[i],filteredNode[i],filteredSourceRow[i]);
      if (fNode){
        errorCtrls.push(fNode);
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
};

contentCheckSwitch.addEventListener("change", function () {
  chrome.storage.sync.set(
    { ContentValidationSwitch: contentCheckSwitch.checked },
    function () {
      console.log("ContentValidationSwitch value is set.");
    }
  );
});

//ignoreFullURL
ignoreFullURL.addEventListener("change", function () {
  chrome.storage.sync.set(
    { IgnoreFullURL: ignoreFullURL.checked },
    function () {
      console.log("IgnoreFullURL value is set.");
    }
  );
});

contentValidationChks.forEach((el) =>
  el.addEventListener("change", (event) => {
    chrome.storage.sync.set(
      { ["contentValChk-" + el.name]: el.checked },
      function () {
        console.log("ContentValidationSwitch value is set.");
      }
    );
  })
);

//ignoreNestedCtrl
ignoreNestedCtrlChk.addEventListener("change", function () {
  chrome.storage.sync.set(
    { IgnoreNestedCtrls: ignoreNestedCtrlChk.checked },
    function () {
      console.log("IgnoreNestedCtrls value is set.");
    }
  );
});

//aliasText
aliasTextChk.addEventListener("change", function () {
  chrome.storage.sync.set(
    { considerAliasAsText: aliasTextChk.checked },
    function () {
      console.log("considerAliasAsText value is set.");
    }
  );
});