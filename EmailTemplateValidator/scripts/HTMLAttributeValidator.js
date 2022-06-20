htmlAttributeValidator.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: ValidateHTMLAttributes,
    args: [htmlAttributeText.value],
  });
});

function ValidateHTMLAttributes(ctrlsWithAttributes) {
  //Clear previous error message
  const errormsg = document.getElementById("my-gale-error-message-css");
  if (errormsg !== null) {
    errormsg.remove();
  }

  //Remove tooltip span
  const boxes = document.querySelectorAll(".gale-tooltip-box");
  boxes.forEach((box) => {
    box.remove();
  });

  //img:src, alt
  //a: href
  var ctrls = ctrlsWithAttributes
    .replaceAll("\n", "\r")
    .replaceAll("\r\r", "\r")
    .split("\r");

  docIndex=-1;
  for (i = 0; i < ctrls.length; i++) {
    var ctrl = ctrls[i].split(":")[0];
    if (ctrl==="document"){
      docIndex = i;
      break;
    }
  }

  language_not_set=false;

  if (docIndex>=0){
    ctrls.splice(docIndex, 1);
    if (!document.documentElement.lang) {
      alert('Document language is not set !!');
      language_not_set=true;
    }
  }

  var ctrlWithIssue = [];
  var errorCtl = {};
  for (i = 0; i < ctrls.length; i++) {
    var ctrl = ctrls[i].split(":")[0];
    var attrs = ctrls[i].split(":")[1].replace("\n", "").trim().split(",");
    var nodes = document.querySelectorAll(ctrl.trim());
    var valueEmpty = false;
    if (!errorCtl.hasOwnProperty(ctrl)) {
      errorCtl[ctrl] = [];
    }
    allControls = [];
    for (x = 0; x < nodes.length; x++) {
      let attrValForCtrl =
        "<span class='gale-tooltip-box'> <b>" + ctrl.toUpperCase() + " :: </b>";
      let atleastOneAttributeToDisplay = false;
      for (y = 0; y < attrs.length; y++) {
        let ignoreForScreen = false;
        let ctrlTypeName = attrs[y].trim();
        if (ctrlTypeName.startsWith("-")) {
          ignoreForScreen = true;
          console.log('Ignore control for display-' + ctrlTypeName);
          ctrlTypeName = attrs[y].substring(1, attrs[y].length);
        }
        var source = nodes[x].getAttribute(ctrlTypeName);
        if (!ignoreForScreen) {
          console.log('Added control for display-' + ctrlTypeName);
          attrValForCtrl += `${ctrlTypeName} = '${source}'  `;
          atleastOneAttributeToDisplay = true;
        }

        if (
          source === "#" ||
          source === "" ||
          source === undefined ||
          source === null
        ) {
          if (valueEmpty === false) {
            valueEmpty = true;
            control = {};
            control[nodes[x].innerText] = [];
            control[nodes[x].innerText].push(ctrlTypeName);
            allControls.push(control);
          }
        }

        if (!ignoreForScreen) {
          attrValForCtrl += "</span>";
          $(attrValForCtrl).insertBefore(nodes[x]);
        }
      }


      if (valueEmpty === true) {
        nodes[x].classList.add("gale-validation-error-box");
        ctrlWithIssue.push(nodes[x]);
        valueEmpty = false;
      }
    }
    if (allControls.length > 0) {
      errorCtl[ctrl].push(allControls);
    }
  }

  console.log(errorCtl);
  any_failure = false;
  if (language_not_set | ctrlWithIssue.length > 0){
    alert(
      "HTML ATTRIBUTES:: Attribute validation failed. Please check screen or console log for details"
    );
    any_failure=true;
  }
  else{
    alert("HTML ATTRIBUTES:: Validation is successful.");
  }

  if (ctrlWithIssue.length > 0) {
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
          }
  
          .gale-tooltip-box {
            display: block;
            color: blanchedalmond;
            background-color: darkcyan;
            font-size: 15px;
            padding-left: 5px;
            padding-right: 5px;
            margin-bottom: -1px;
            padding-bottom: 3px;
            line-height: 1.2;
          }
        `)
    );

    // add it to the head
    if (document.getElementById("my-gale-error-message-css") === null) {
      const head = document.getElementsByTagName("head")[0];
      style.setAttribute("id", "my-gale-error-message-css");
      head.appendChild(style);
    }
  }
}

htmlAttributeText.addEventListener("blur", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: SetCtrlValue,
    args: [htmlAttributeText.value],
  });
});

function SetCtrlValue(val) {
  chrome.storage.sync.set({Attrs: val}, function() {
    console.log('Plugin value is set.');
  });  
}

htmlAttrsSwitch.addEventListener('change', function () {
  chrome.storage.sync.set({AttrsSwitch: htmlAttrsSwitch.checked}, function() {
    console.log('AttrsSwitch value is set.');
  });  
});
