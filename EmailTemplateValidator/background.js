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

    let nextHTMLContent = nextSibs.join('');
    let previousHTMLContext = prevSibs.reverse().join('');
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
        formattedText = `${firstPart}<${info.menuItemId}>${selectedText}</${info.menuItemId}>${lastPart}`;
        break;
      case "HTMLEditor":
        break;
      default:
        break;
    }
    if (formattedText !== "") {
      ctrl.innerHTML = previousHTMLContext + formattedText + nextHTMLContent;
    }
  }
}
