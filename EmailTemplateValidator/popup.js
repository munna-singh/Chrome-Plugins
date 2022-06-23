var validateTag = document.getElementById("btnValidateTag");
var exampleGenerator = document.getElementById("exampleFileGenerator");
var enableVisualEditor = document.getElementById("enableVisualEditor");
var htmlAttributeValidator = document.getElementById("btnValidateAttributes");
var htmlAttributeText = document.getElementById("htmlAttributes");
var saveDOM = document.getElementById("saveDOM");
var linkValidator = document.getElementById("btnValidateLink");
var globalValidator = document.getElementById("globalValidator");
var ignoreFullURL = document.getElementById("ignore-full-URL");
var ignoreNestedCtrlChk = document.getElementById("ignore-anchro-inside-ctrls");
var aliasTextChk = document.getElementById("alias-text");
var releaseVersion = document.getElementById("release-version");
//Toggle box
var htmlAttrsSwitch = document.getElementById("htmlAttrsChk");
var linkValidatorSwitch = document.getElementById("linkValidatorChk");
var contentCheckSwitch = document.getElementById("htmlContentChk");

//All content checkbox
var contentValidationChks = document.querySelectorAll(".ctrl-chkbox");

//Print version
releaseVersion.innerHTML = 'V ' + chrome.runtime.getManifest()['version'];

// Accordian
let headings = document.querySelectorAll(".heading");
headings.forEach(function (heading) {
  heading.addEventListener("click", function () {
    let hedingActive = document.querySelector(".heading.active");
    if (hedingActive && hedingActive !== heading) {
      hedingActive.classList.remove("active");
    }
    heading.classList.toggle("active");
  });
});
let fieldset = document.querySelectorAll("fieldset");
fieldset[0].classList.add("firstfield");
fieldset[fieldset.length - 1].classList.add("lastfield");

//Global Validator click action
globalValidator.addEventListener("click", async () => {
  let activeCtrl = false;

  //HTML Attribute Validator
  if (htmlAttrsSwitch.checked) {
    htmlAttributeValidator.click();
    activeCtrl = true;
  }
  //Link Validator
  if (linkValidatorSwitch.checked) {
    linkValidator.click();
    activeCtrl = true;
  }
  //HTML Content Validator
  if (contentCheckSwitch.checked) {
    validateTag.click();
    activeCtrl = true;
  }

  if (activeCtrl === false) {
    alert("Please enable validation switch to start the validation.");
  }
});

document.getElementById("visual").addEventListener("change", function () {
  if (document.getElementById("visual").checked == true) {
    document.getElementById("visualcontent").classList.add("active");
    enableVisualEditor.click();
  } else {
    document.getElementById("visualcontent").classList.remove("active");
  }
});
