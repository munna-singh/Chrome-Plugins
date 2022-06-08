let color = "#3aa757";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  console.log("Default background color set to %cgreen", `color: ${color}`);

  var contextMenuItem = {
    id: "GALEEmailValidator",
    title: "Gale Page Validator",
    contexts: ["selection"],
  };
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create(contextMenuItem);
  chrome.contextMenus.create({
    title: "Subscript",
    parentId: "GALEEmailValidator",
    id: "sub",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    title: "Superscript",
    parentId: "GALEEmailValidator",
    id: "sup",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    title: "Bold",
    parentId: "GALEEmailValidator",
    id: "strong",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    title: "Italic",
    parentId: "GALEEmailValidator",
    id: "em",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    title: "Underline",
    parentId: "GALEEmailValidator",
    id: "u",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    title: "Strikethrough",
    parentId: "GALEEmailValidator",
    id: "s",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    title: "Anchor Tag",
    parentId: "GALEEmailValidator",
    id: "a",
    contexts: ["selection"],
  });
  chrome.contextMenus.create({
    title: "HTML Editor",
    parentId: "GALEEmailValidator",
    id: "HTMLEditor",
    contexts: ["selection"],
  });
});

var LAST_SELECTION, LAST_ELEMENT;
chrome.contextMenus.onClicked.addListener(contextMenuHandler);
function contextMenuHandler(info, tab) {
  // Execute the file which will be working on foreground.
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: TestContextMenu,
    args: [info],
  });
}
function TestContextMenu(info) {
  debugger;
  if (typeof LAST_SELECTION != "undefined" && LAST_SELECTION) {
    let elem = LAST_SELECTION.anchorNode;
    let nextSibs = [];
    let prevSibs = [];
    while ((elem = elem.nextSibling)) {
      if (elem.nodeType === 3) {
        // text node
        nextSibs.push(elem.data);
      } else {
        nextSibs.push(elem.outerHTML);
      }
    }
    //previousSibling
    elem = LAST_SELECTION.anchorNode;
    while ((elem = elem.previousSibling)) {
      if (elem.nodeType === 3) {
        // text node
        prevSibs.push(elem.data);
      } else {
        prevSibs.push(elem.outerHTML);
      }
    }

    let nextHTMLContent = nextSibs.join("");
    let previousHTMLContext = prevSibs.reverse().join("");
    let ctrl = LAST_SELECTION.getRangeAt(0).startContainer.parentNode;
    let innerHTMLVal = LAST_SELECTION.anchorNode.textContent; //ctrl.innerHTML;
    let formattedText = "";
    let firstPart = innerHTMLVal.substring(0, LAST_SELECTION.anchorOffset);
    let lastPart = innerHTMLVal.substring(LAST_SELECTION.extentOffset);
    let selectedText = info.selectionText;
    switch (info.menuItemId) {
      case "sub":
      case "sup":
      case "strong":
      case "em":
      case "u":
      case "s":
        formattedText = `${firstPart}<${info.menuItemId}>${selectedText}</${info.menuItemId}>${lastPart}`;
        break;
      case "a":
        formattedText = `${firstPart}<${info.menuItemId} href='#' alias=''>${selectedText}</${info.menuItemId}>${lastPart}`;
        break;
      case "HTMLEditor":
        //Disable edit option
        document.designMode = "off";
        var modal = document.getElementById("my-gale-popup-modal");
        var dynamicDiv = document.getElementById("dynamic-text-div");
        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];
        // Get the button that opens the modal
        var btnUpdate = document.getElementById("btnUpdateImgSrc");

        let dynamicContent =
          "<table width='100%'><tr><td><h1 style='color: maroon;'>Rich Text Editor</h1></td></tr>";
        dynamicContent += `<tr><td> <textarea id="GALE-RTE"  style="width: 90%;">${ctrl.innerHTML}</textarea></td></tr>`;

        dynamicContent += "</table>";
        dynamicDiv.innerHTML = dynamicContent;

        if (tinymce.activeEditor === null) {
          tinymce.init({
            selector: "#GALE-RTE",
          });
        }

        modal.style.display = "block";

        //Update source code
        btnUpdate.onclick = function () {
          debugger;
          let rte = tinymce.activeEditor.getContent();
          if (rte.startsWith("<p>")) {
            rte = rte.substring(3, rte.length - 4);
          }
          ctrl.innerHTML = rte;
          modal.style.display = "none";
          //Enable edit option
          document.designMode = "on";
        };

        // When the user clicks on <span> (x), close the modal
        span.onclick = function () {
          modal.style.display = "none";
          tinymce.remove();
          //Enable edit option
          document.designMode = "on";
        };

        break;
      default:
        break;
    }
    if (formattedText !== "") {
      ctrl.innerHTML = previousHTMLContext + formattedText + nextHTMLContent;
    }
  }
}
