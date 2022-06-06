enableVisualEditor.addEventListener("click", async () => {
  saveDOM.disabled = false;
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: EnableVEditor,
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
    const head = document.getElementsByTagName("head")[0];
    style.setAttribute("id", "my-gale-popup-modal-css");
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

  var imgs = document.querySelectorAll("img");
  imgs.forEach((img) => {
    img.addEventListener("click", (event) => {
      // Get the modal
      var modal = document.getElementById("my-gale-popup-modal");
      var dynamicDiv = document.getElementById("dynamic-text-div");

      // Get the button that opens the modal
      var btnUpdate = document.getElementById("btnUpdateImgSrc");

      // Get the <span> element that closes the modal
      var span = document.getElementsByClassName("close")[0];

      // When the user clicks the button, open the modal
      let dynamicContent =
        "<table><tr><td></td><td><h1 style='color: maroon;'>Image</h1></td></tr>";
      img.getAttributeNames().forEach(function (val) {
        dynamicContent += `<tr><td> ${val} </td><td> <textarea id="GALE-${val}"  style="width: 500px;">${img.getAttribute(
          val
        )}</textarea></td></tr>`;
      });
      dynamicContent += "</table>";
      dynamicDiv.innerHTML = dynamicContent;
      modal.style.display = "block";

      //Update source code
      btnUpdate.onclick = function () {
        img.getAttributeNames().forEach(function (val) {
          img.setAttribute(val, document.getElementById("GALE-" + val).value);
        });
        modal.style.display = "none";
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
        // Get the modal
        var modal = document.getElementById("my-gale-popup-modal");
        var dynamicDiv = document.getElementById("dynamic-text-div");

        // Get the button that opens the modal
        var btnUpdate = document.getElementById("btnUpdateImgSrc");

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        // When the user clicks the button, open the modal

        let dynamicContent =
          "<table><tr><td></td><td><h1 style='color: maroon;'>Anchor</h1></td></tr>";
        anchor.getAttributeNames().forEach(function (val) {
          dynamicContent += `<tr><td> ${val} </td><td> <textarea id="GALE-${val}"  style="width: 500px;">${anchor.getAttribute(
            val
          )}</textarea></td></tr>`;
        });
        dynamicContent += "</table>";
        dynamicDiv.innerHTML = dynamicContent;

        modal.style.display = "block";

        //Update source code
        btnUpdate.onclick = function () {
          anchor.getAttributeNames().forEach(function (val) {
            anchor.setAttribute(
              val,
              document.getElementById("GALE-" + val).value
            );
          });
          modal.style.display = "none";
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
      }
    });
  });
}

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
}
