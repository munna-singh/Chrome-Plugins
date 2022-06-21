exampleGenerator.addEventListener("click", async () => {
  var ctrlToValidate = document.querySelectorAll(".ctrl-chkbox:checked");

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
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: GetDOMStructureFromCurrentTab,
    args: [seletedCtrls],
  });
});

function GetDOMStructureFromCurrentTab(ctrls) {
  var nodes = document.querySelectorAll(ctrls.join(","));
  var data = [];
  var valCleaner = function(value){
    if(value === undefined || value === null || value==''){
      return "";
    }
    var ctlvalue = value.replace(/"/g, '""');
    ctlvalue = '"' + ctlvalue + '"';
    ctlvalue = ctlvalue.replace(/\u00a0/g, " ");
    ctlvalue = ctlvalue.replace(/\u200C/g, "");
    ctlvalue = ctlvalue.trim();
    return ctlvalue;
  };
  for (var i = 0; i < nodes.length; i++) {
    var source = null;
    var nodeName = nodes[i].nodeName;
    if (nodeName === "A") {
      source = nodes[i].getAttribute("href");
    } else if (nodeName === "IMG") {
      source = nodes[i].getAttribute("src");
    }
    if (source === "#") {
      source = null;
    }
    ctrlId = nodes[i].getAttribute("Id");
    var ctlvalue = valCleaner(nodes[i].outerText);
    var ctrlAlias = valCleaner(nodes[i].getAttribute("alias"));
    
    var ctrl = [
      nodes[i].nodeName,
      ctrlId,
      ctlvalue,
      ctrlAlias,
      source,
      nodes[i].getAttribute("alt"),
    ];
    data.push(ctrl);
  }
  var csv = "Ctrl, Id, Text, Alias, Link, Alt\n";
  data.forEach(function (row) {
    csv += row.join(",");
    csv += "\n";
  });

  var hiddenElement = document.createElement("a");
  hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
  hiddenElement.target = "_blank";
  hiddenElement.download = "SampleData.csv";
  hiddenElement.click();
}
