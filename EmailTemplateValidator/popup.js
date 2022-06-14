var validateTag = document.getElementById("btnValidateTag");
var exampleGenerator = document.getElementById("exampleFileGenerator");
var enableVisualEditor = document.getElementById("enableVisualEditor");
var htmlAttributeValidator = document.getElementById("btnValidateAttributes");
var htmlAttributeText = document.getElementById("htmlAttributes");
var saveDOM = document.getElementById("saveDOM");
var linkValidator = document.getElementById("btnValidateLink");
// Accordian 
let headings = document.querySelectorAll(".heading");
headings.forEach(function(heading){
    heading.addEventListener('click', function(){
        let hedingActive = document.querySelector(".heading.active");
        if(hedingActive && hedingActive!==heading){
            hedingActive.classList.remove("active");
        }
        heading.classList.toggle("active");
    })
})
let fieldset = document.querySelectorAll('fieldset');
fieldset[0].classList.add("firstfield");
fieldset[fieldset.length - 1].classList.add("lastfield");
document.getElementById("visual").addEventListener("change", function() {
    if (document.getElementById("visual").checked == true) {
      document.getElementById('visualcontent').classList.add("active");
    } else {
        document.getElementById('visualcontent').classList.remove("active");
    }
  });
  