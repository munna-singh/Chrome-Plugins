//Load local storage data
function prepopulateData() {
    // debugger;
    chrome.storage.sync.get(null, function(items) {
        //Attributes data
        if(items.Attrs && items.Attrs !== null && items.Attrs !== ""){
            htmlAttributeText.value = items.Attrs;
        }

        //Attribute switch
        if(items.AttrsSwitch != undefined && items.AttrsSwitch !== null && items.AttrsSwitch !== ""){
            htmlAttrsSwitch.checked = items.AttrsSwitch;
        }

        //ValidateLinkSwitch
        if(items.ValidateLinkSwitch != undefined && items.ValidateLinkSwitch !== null && items.ValidateLinkSwitch !== ""){
            linkValidatorSwitch.checked = items.ValidateLinkSwitch;
        }

        //Content Validation Switch
        if(items.ContentValidationSwitch != undefined && items.ContentValidationSwitch !== null && items.ContentValidationSwitch !== ""){
            contentCheckSwitch.checked = items.ContentValidationSwitch;
        }

        //Content validation checkbox
        document.querySelectorAll(".ctrl-chkbox").forEach(function(ctrl){
            let val = items["contentValChk-" + ctrl.name];
            if(val != undefined && val !== null && val !== ""){
                ctrl.checked = val;
            }
        });

        //Content Validation Switch
        if(items.IgnoreFullURL != undefined && items.IgnoreFullURL !== null && items.IgnoreFullURL !== ""){
            ignoreFullURL.checked = items.IgnoreFullURL;
        }

        //Nested Ctrl checkbox
        if(items.IgnoreNestedCtrls != undefined && items.IgnoreNestedCtrls !== null && items.IgnoreNestedCtrls !== ""){
            ignoreNestedCtrlChk.checked = items.IgnoreNestedCtrls;
        }

        //Alias text checkbox
        if(items.considerAliasAsText != undefined && items.considerAliasAsText !== null && items.considerAliasAsText !== ""){
            aliasTextChk.checked = items.considerAliasAsText;
        }
    });
}

prepopulateData();