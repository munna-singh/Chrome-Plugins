enableVisualEditor.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: EnableVEditor,
    args: [chrome.runtime.getURL("popup.html")],
  });
});

saveDOM.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let fileName = document.getElementById("txteditedfilename").value;
  if (fileName == "") {
    fileName = "modifiedPage";
  }
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: saveDOMAndDownload,
    args: [fileName],
  });
});

this.EnableVEditor = function (pluginPath) {
  document.designMode = "on";

  document.body.addEventListener(
    "contextmenu",
    function (e) {
      LAST_SELECTION = window.getSelection();
      LAST_ELEMENT = e.target;
    },
    false
  );

  // add the CSS as a string using template literals
  const head = document.getElementsByTagName("head")[0];

  const style = document.createElement("style");
  style.setAttribute("id", "my-gale-popup-modal-css");
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
          width: 60%;
          flex-direction: column;
        }
        
        /* The Close Button */
        .close {
          color: #000 !important;
          float: right;
          font-size: 28px;
          font-weight: bold;
          right: 100px;
          position: absolute;
          margin-right: 261px; 
          top: 102px; 
          color: red !important;
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
    head.appendChild(style);
  }

  var divTag = document.createElement("div");
  divTag.setAttribute("id", "my-gale-popup-modal");
  divTag.setAttribute("class", "modal");
  divTag.innerHTML = `
        <!-- Modal content -->
        <div class="modal-content"  style="min-height: 250px;vertical-align: middle;display: flex;align-items: center;justify-content: center;">
          <span class="close">&times;</span>
          <div id="dynamic-text-div"></div>
          <div>
            <input type="button" id ="btnUpdateImgSrc" value="Update" style="width: 200px; height:50px; background-color: orange;"></input>
          </div>
                  
        </div>
      `;
  // add it to the head
  if (document.getElementById("my-gale-popup-modal") === null) {
    const body = document.getElementsByTagName("body")[0];
    body.appendChild(divTag);
  }

  // Get the modal
  var modal = document.getElementById("my-gale-popup-modal");
  var dynamicDiv = document.getElementById("dynamic-text-div");

  // Get the button that opens the modal
  var btnUpdate = document.getElementById("btnUpdateImgSrc");

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];

  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = "none";
    //Enable edit mode
    document.designMode = "on";
  };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
      //Enable edit mode
      document.designMode = "on";
    }
  };

  var imgs = document.querySelectorAll("img");
  imgs.forEach((img) => {
    img.addEventListener("click", (event) => {
      //Disable edit mode
      document.designMode = "off";
      // When the user clicks the button, open the modal
      createDynamicAttributeControl(img, dynamicDiv, modal);

      //Update source code
      btnUpdate.onclick = function () {
        updateAttributes(img);
      };
    });
  });

  var anchors = document.querySelectorAll("a");
  anchors.forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      event.preventDefault();
      //Disable edit mode
      document.designMode = "off";

      const childCtrl =
        anchor.children.length > 0 ? anchor.children[0].nodeName : "Unknown";
      let showAnchor = true;
      if (childCtrl === "IMG") {
        if (window.confirm("Do you want to update link URL?")) {
          showAnchor = true;
        } else {
          showAnchor = false;
        }
      } else {
        showAnchor = true;
      }
      if (showAnchor) {
        // When the user clicks the button, open the modal
        createDynamicAttributeControl(anchor, dynamicDiv, modal);

        //Update source code
        btnUpdate.onclick = function () {
          updateAttributes(anchor);
        };
      }
    });
  });

  updateAttributes = function (ctrl) {
    ctrl.getAttributeNames().forEach(function (val) {
      if (val[0].match(/[a-zA-Z]/i) && !val.match(/[`~!@#$%^&*\(\)+]/i)) {
        ctrl.setAttribute(val, document.getElementById("GALE-" + val).value);
      }
    });
    modal.style.display = "none";
    //Enable edit mode
    document.designMode = "on";
  };
  createDynamicAttributeControl = function (ctrl) {
    let ctrlName = { A: "Anchor", IMG: "Image" };
    let dynamicContent =
      "<table><tr><td></td><td><h1 style='color: maroon;'>" +
      ctrlName[ctrl.nodeName] +
      "</h1></td></tr>";
    ctrl.getAttributeNames().forEach(function (val) {
      if (val[0].match(/[a-zA-Z]/i) && !val.match(/[`~!@#$%^&*\(\)+]/i)) {
        dynamicContent += `<tr><td> ${val} </td><td> <textarea id="GALE-${val}"  style="width: 500px;">${ctrl.getAttribute(
          val
        )}</textarea></td></tr>`;
      }
    });
    dynamicContent += "</table>";
    dynamicDiv.innerHTML = dynamicContent;

    modal.style.display = "block";
  };
  alert("Visual editor is enabled.");
};

this.saveDOMAndDownload = function (file_name) {
  //Remove injected code from DOM:

  var injectedClassIds = [
    "my-gale-popup-modal",
    "my-gale-popup-modal-css",
    "my-gale-error-message-css",
  ];
  injectedClassIds.forEach(function (e) {
    const ctrl = document.getElementById(e);
    if (ctrl !== null) {
      ctrl.remove();
    }
  });

  //Remove tooltip span
  const boxes = document.querySelectorAll(".gale-tooltip-box");
  boxes.forEach((box) => {
    box.remove();
  });

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
};
