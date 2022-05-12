var validateTag = document.getElementById("btnValidateTag");
var exampleGenerator = document.getElementById("exampleFileGenerator");
var enableVisualEditor = document.getElementById("enableVisualEditor");
var htmlAttributeValidator = document.getElementById("btnValidateAttributes");
var htmlAttributeText = document.getElementById("htmlAttributes");
var saveDOM = document.getElementById("saveDOM");
var linkValidator = document.getElementById("btnValidateLink");
var figmaPullContent = document.getElementById("btnPullContent");
var validateMatchOptCtrl = document.getElementById("match_options");

figmaPullContent.addEventListener("click", async () => {
  var figmaFile = document.getElementById("txtFigmaFile");
  var figmaNode = document.getElementById("txtFigmaNodeId");
  var token = document.getElementById("txtFigmaPAT");
  // url: `https://api.figma.com/v1/files/NOLD0VqlLthvIPKRoU3M3A/nodes?ids=511:5617`,
  var figmaPageId=figmaFile.value;
  var figmaNodeId=figmaNode.value;
  var figmaUrl=`https://api.figma.com/v1/files/${figmaPageId}/nodes?ids=${figmaNodeId}`;
  alert(`Figma Api Requested -> ${figmaUrl}`);
  
  $.ajax({
    type: "GET",
    url: figmaUrl,
    headers: { "X-Figma-Token": "376646-3fac65f7-6fb8-4bd6-8bb2-956ed4cc1e77" },
    success: function (res) {
      var nodestyles = res.nodes[figmaNodeId].styles;
      // var filteredResult = res.nodes[figmaNodeId].document.children.filter(function (obj) {
      //   return obj.type == "FRAME";
      // });
      // var childs = []
      // filteredResult.forEach(element => {
      //   GetChild(element, childs);
      // });
      
      // GetChild(filteredResult[0], childs);
      var nodestyles = res.nodes[figmaNodeId].styles;
      // var filteredResult = data.nodes[document_node_id].document.children.filter(function (obj) {
      //     return obj.type == "FRAME";
      // });
      var filteredResult = res.nodes[figmaNodeId].document.children;
      var childs = []

      // Get all child items and recurse through all nodes
      GetChild(filteredResult, childs);

      var secFilter = [];
      var prevVal = '';
      var justTextContent=[];

      childs.forEach(element => {

        //Find text container type, h1/h2,etc

        if (element.type === "VECTOR"){
          var idindex = element.id.lastIndexOf(":");
          var tid = element.id.substring(0,idindex);
          if(prevVal !== tid){
            element.ctrlType - "IMG";
            secFilter.push(element);
            prevVal = tid;
          }
        } else if (element.type === "RECTANGLE"){
          if (element.fills && element.fills.length > 0){
            element.fills.forEach(fill => {
              if(fill.type === "IMAGE"){
                element.type = "IMAGE";
                element.ctrlType - "IMG";
              }
            });
          }
          secFilter.push(element);

        } else if (element.type === "TEXT"){

          var ctrlType = "";
          if(element.styles){
              ctrlType = nodestyles[element.styles.text?element.styles.text:element.styles.fill].name;
          }

          if (element.name='button'){
              ctrlType = "a";
          }

          element.ctrlType = ctrlType;

          var content  = element.characters.replace('\n', '')
          justTextContent.push({'section_name':element.name, 'text': content, 'ctlType': ctrlType});

          secFilter.push(element);
        }else {
          secFilter.push(element);
        }
      });

      
      justTextContent.forEach(item=> {
          console.info(item);
      })
      localStorage.setItem('FigmaNodeChars', JSON.stringify(justTextContent));
      alert(`Total content items saved in localstorage --> ${justTextContent.length}`);
      var itemsInStorage  = localStorage.getItem('FigmaNodeChars');
      console.info(itemsInStorage);
      // const formatter = new JSONFormatter(justTextContent);
      // // $("#pageJson").append(formatter.render());
      // document.body.appendChild(formatter.render());
      
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      alert(
        "Unable to fullfill the request right now. Please try after some time."
      );
    },
    dataType: "json",
    async: false,
  });
});

// function GetChild(node, lists){
//   if(node.children && node.children.length > 0){
//     node.children.forEach(child => {
//       if(child.children && child.children.length > 0){
//         GetChild(child, lists);
//       } else {
//         lists.push(child);
//       }
//     });
    
//   }
// }

function GetChild(nodes, lists){
  nodes.forEach(child => {
      if(child.children && child.children.length > 0){
          GetChild(child.children, lists);
      } else {
          lists.push(child);
      }
  });
}

function PullFigmaData() {}

linkValidator.addEventListener("click", async () => {
  // Get the in progress text
  document.getElementById("validationinprogress").innerHTML ="Validation is in progress ...";
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
    if (val !== "#" && val !== "" && val !== "/" && val != null) {
      req_params.push(link.href);
      var oneurl = {
        text: link.innerText,
        link: link.href,
        redirectlink: "",
      };
      urls[link.href] = oneurl;
    }
  });

  if (req_params.length > 0) {
    $.ajax({
      type: "POST",
      url: "https://bweetsuyqkdnzjtzpe4ahndk7u0botiy.lambda-url.us-west-2.on.aws/",
      data: JSON.stringify(req_params),
      success: function (res) {
        var csv = "Link_Text,Original_Link, Resp_Code, Redirect_url\n";
        res.forEach(function (row) {
          csv += `${urls[row.source_url].text},${row.source_url},${row.response_code},${row.redirect_url}\n` ;
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
      contentType : 'text/plain; charset=UTF-8',
      async: false
    });
  }
}

saveDOM.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let fileName = document.getElementById("txteditedfilename").value;
  if(fileName == ''){
    fileName = "modifiedPage";
  }
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: saveDOMAndDownload,
    args: [fileName],
  });
});

function saveDOMAndDownload(file_name) {
  //Remove injected code from DOM:
  //Popup
  const popDiv = document.getElementById("my-gale-popup-modal");
  if (popDiv !== null) {
    popDiv.remove();
  }

  const popcss = document.getElementById("my-gale-popup-modal-css");
  if (popcss !== null) {
    popcss.remove();
  }

  const errormsg = document.getElementById("my-gale-error-message-css");
  if (errormsg !== null) {
    errormsg.remove();
  }

  var dom =
    new XMLSerializer().serializeToString(document.doctype) +
    "\r" +
    document.documentElement.outerHTML;
  var hiddenElement = document.createElement("a");
  hiddenElement.href =
    "data:text/plain;charset=utf-8," + encodeURIComponent(dom);
  hiddenElement.target = "_blank";
  hiddenElement.download = file_name + ".html";
  hiddenElement.click();
}

htmlAttributeValidator.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: ValidateHTMLAttributes,
    args: [htmlAttributeText.innerHTML],
  });
});

function ValidateHTMLAttributes(ctrlsWithAttributes) {
  //img:src, alt
  //a: href
  var ctrls = ctrlsWithAttributes.split("\r");
  var ctrlWithIssue = [];
  var errorCtl = {};
  for (i = 0; i < ctrls.length; i++) {
    var ctrl = ctrls[i].split(":")[0];
    var attrs = ctrls[i].split(":")[1].replace("\n", "").trim().split(",");
    var nodes = document.querySelectorAll(ctrl);
    var valueEmpty = false;
    if (!errorCtl.hasOwnProperty(ctrl)){
      errorCtl[ctrl]=[];
    }
    allControls=[];
    for (x = 0; x < nodes.length; x++) {

      for (y = 0; y < attrs.length; y++) {
        var source = nodes[x].getAttribute(attrs[y]);
        if (source === "#" || source === "" || source === undefined) {
          valueEmpty = true;
          control={};
          control[nodes[x].innerText]=[];
          control[nodes[x].innerText].push(attrs[y]);
          allControls.push(control);
          break;
        }
      }
      if (valueEmpty === true) {
        nodes[x].classList.add("gale-validation-error-box");
        ctrlWithIssue.push(nodes[x]);
        valueEmpty = false;
      }
    }
    errorCtl[ctrl].push(allControls);
  }

  console.log(errorCtl);
  if (ctrlWithIssue.length > 0) {
    alert("Has issue with the control. Please check console log for details.");
    // create a style element
    const style = document.createElement("style");

    // add the CSS as a string using template literals
    style.appendChild(
      document.createTextNode(`
        .gale-validation-error-box {
          border-radius: 2px;
          border-color: red;
          border-width: 5px;
          border-style: solid;
        }`)
    );

    // add it to the head
    if (document.getElementById("my-gale-error-message-css") === null) {
      const head = document.getElementsByTagName("head")[0];
      style.setAttribute("id", "my-gale-error-message-css");
      head.appendChild(style);
    }
  } else {
    alert("Validation is successful.")
  }
}

enableVisualEditor.addEventListener("click", async () => {
  saveDOM.disabled = false;
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: EnableVEditor,
  });
});
function EnableVEditor() {
  document.designMode = "on";
  // add the CSS as a string using template literals
  const style = document.createElement("style");
  style.appendChild(
    document.createTextNode(`
      /* The Modal (background) */
      .modal {
        display: none; /* Hidden by default */
        position: fixed; /* Stay in place */
        z-index: 1; /* Sit on top */
        padding-top: 100px; /* Location of the box */
        left: 0;
        top: 0;
        width: 100%; /* Full width */
        height: 100%; /* Full height */
        overflow: auto; /* Enable scroll if needed */
        background-color: rgb(0,0,0); /* Fallback color */
        background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
      }
      
      /* Modal Content */
      .modal-content {
        background-color: #fefefe;
        margin: auto;
        padding: 20px;
        border: 1px solid #888;
        width: 80%;
      }
      
      /* The Close Button */
      .close {
        color: #aaaaaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
      }
      
      .close:hover,
      .close:focus {
        color: #000;
        text-decoration: none;
        cursor: pointer;
      }  
    `)
  );

  // add it to the head
  if (document.getElementById("my-gale-popup-modal-css") === null) {
    const head = document.getElementsByTagName("head")[0];
    style.setAttribute("id", "my-gale-popup-modal-css");
    head.appendChild(style);
  }

  var divTag = document.createElement("div");
  divTag.setAttribute("id", "my-gale-popup-modal");
  divTag.setAttribute("class", "modal");
  divTag.innerHTML = `
      <!-- Modal content -->
      <div class="modal-content">
        <span class="close">&times;</span>
        <table>
            <tr>
                <td>Image Src</td>
                <td><textarea id="imgSrc"></textarea></td>
            </tr>
            <tr>
                <td>Image Alt</td>
                <td><input type="text" id="imgAlt"></input></td>
            </tr>
            <tr>
                <td></td>
                <td><input type="button" id ="btnUpdateImgSrc" value="Update"></input></td>
            </tr>
        </table>
        
    </div>
    `;
  // add it to the head
  if (document.getElementById("my-gale-popup-modal") === null) {
    const body = document.getElementsByTagName("body")[0];
    body.appendChild(divTag);
  }

  var imgs = document.querySelectorAll("img");
  imgs.forEach((img) => {
    img.addEventListener("click", (event) => {
      // Get the modal
      var modal = document.getElementById("my-gale-popup-modal");

      // Get the button that opens the modal
      var btnUpdate = document.getElementById("btnUpdateImgSrc");

      // Get the <span> element that closes the modal
      var span = document.getElementsByClassName("close")[0];

      // When the user clicks the button, open the modal

      modal.style.display = "block";
      document.getElementById("imgSrc").value = img.getAttribute("src");
      document.getElementById("imgAlt").value = img.getAttribute("Alt");

      //Update source code
      btnUpdate.onclick = function () {
        img.src = document.getElementById("imgSrc").value;
        img.setAttribute("Alt", document.getElementById("imgAlt").value);
      };
      // When the user clicks on <span> (x), close the modal
      span.onclick = function () {
        modal.style.display = "none";
      };

      // When the user clicks anywhere outside of the modal, close it
      window.onclick = function (event) {
        if (event.target == modal) {
          modal.style.display = "none";
        }
      };
    });
  });
  var anchors = document.querySelectorAll("a");
  anchors.forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      event.preventDefault();
      // Get the modal
      var modal = document.getElementById("my-gale-popup-modal");

      // Get the button that opens the modal
      var btnUpdate = document.getElementById("btnUpdateImgSrc");

      // Get the <span> element that closes the modal
      var span = document.getElementsByClassName("close")[0];

      // When the user clicks the button, open the modal

      modal.style.display = "block";
      document.getElementById("imgSrc").value = anchor.getAttribute("href");

      //Update source code
      btnUpdate.onclick = function () {
        anchor.href = document.getElementById("imgSrc").value;
      };
      // When the user clicks on <span> (x), close the modal
      span.onclick = function () {
        modal.style.display = "none";
      };

      // When the user clicks anywhere outside of the modal, close it
      window.onclick = function (event) {
        if (event.target == modal) {
          modal.style.display = "none";
        }
      };
    });
  });
}

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
    var ctlvalue = nodes[i].outerText.replace(/"/g, '""');
    ctlvalue = '"' + ctlvalue + '"';

    ctlvalue = ctlvalue.replace(/\u00a0/g, " ")

    ctlvalue = ctlvalue.replace(/\u200C/g, '')

    var ctrl = [
      nodes[i].nodeName,
      ctrlId,
      ctlvalue,
      source,
      nodes[i].getAttribute("alt"),
    ];
    data.push(ctrl);
  }
  var csv = "Ctrl, Id, Text, Link, Alt\n";
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

function ValidateNode(sourceFileData, ctrls, ignoreNestedCtrl) {
  if (!sourceFileData) {
    return;
  }
  //Clear previous error message by removing the class
  var errorCtrls = document.querySelectorAll(".gale-validation-error-box");
  for (y = 0; y < errorCtrls.length; y++) {
    errorCtrls[y].classList.remove("gale-validation-error-box");
  }

  let allRows = sourceFileData.split(/\r?\n|\r/);
  //Filter data
  let filteredSourceRow = [];
  for (x = 1; x < allRows.length; x++) {
    let splited = allRows[x].split(",");
    if (
      ctrls.find((element) => element.toUpperCase() == splited[0].toUpperCase())
    ) {
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
    let ctrlText = filteredNode[i].outerText;
    if (
      filteredNode[i].outerText === undefined ||
      filteredNode[i].outerText === null
    ) {
      ctrlText = "";
    }
    let altText = filteredNode[i].getAttribute("alt");
    if (
      filteredNode[i].getAttribute("alt") === undefined ||
      filteredNode[i].getAttribute("alt") === null
    ) {
      altText = "";
    }
    let compareString =
      nodeName + "," + ctrlText + "," + source + "," + altText;

    if (filteredSourceRow[i].join(",") !== compareString) {
      filteredNode[i].classList.add("gale-validation-error-box");
      errorCtrls.push(filteredNode[i]);
    }
  }
  if (errorCtrls.length === 0) {
    alert("Validation successful. No discrepancy detected!!!");
  } else {
    alert(
      "Validation error. Please check console log for list of controls which has issue"
    );
    console.log(errorCtrls);
    // create a style element
    const style = document.createElement("style");

    // add the CSS as a string using template literals
    style.appendChild(
      document.createTextNode(`
  .gale-validation-error-box { 
    border-radius: 2px;
    border-color: red;
    border-width: 5px;
    border-style: solid;
  }`)
    );

    // add it to the head
    const head = document.getElementsByTagName("head")[0];
    head.appendChild(style);
  }
}

validateTag.addEventListener("click", async () => {
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
          args: [e.target.result, seletedCtrls, ignoreNestedCtrl],
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
