//this file represents the client side of application

$(document).ready(function () {

    // -------- TAB 1 --------

    // function used on click for search buton 
    jQuery("#searchButton").click(function () {
        jQuery.ajax({
            type: "GET",
            url: 'http://localhost:3001/all',
            crossDomain: true,
            withCredentials: true,
            dataType: "jsonp",
            data: {
                formularName: document.getElementById("formularName").value
            },

            success: function (response) {
                entry = response[0];

                var arrayOfObjects = Object.values(entry)[0];  // objects received from database

                clearBox("panel1");

                // creating elements
                if (arrayOfObjects != null) {
                    var len = arrayOfObjects.length;
                    if (len != 0) {   // if array is not empty
                        var row = 0;  // counter of created rows 
                        while (arrayOfObjects[row] != null && arrayOfObjects[row].hasOwnProperty('elementid')) {
                            var obj = Object.values(arrayOfObjects[row]);  // one element 
                            var label = obj[0];
                            var elementId = obj[1];
                            var validation = obj[2];
                            var elementType = obj[3];

                            //the process is similar to adding elements in zadatak.js (there is detailed description),
                            // but now we use received data from base
                            var elementContainer = document.createElement("div");
                            var containerForLabels = document.createElement("div");
                            var input = document.createElement("input");
                            var textnode = document.createTextNode("Element " + elNumber + " :");
                            var select1 = document.createElement("select");
                            var select2 = document.createElement("select");
                            var selectNumber = document.createElement("select");
                            var addButton = document.createElement("input");
                            var selectArray1 = ["Textbox", "Checkbox", "Radio buttons"];
                            var selectArray2 = ["Mandatory", "None", "Numeric"];

                            elementContainer.id = elementId;
                            containerForLabels.id = "radioButtonLabel" + elementId;
                            containerForLabels.style.display = "none";

                            input.type = "text";
                            if (label != null)
                                input.value = label;
                            else {
                                input.placeholder = "Label " + elNumber;
                            }
                            input.style.fontSize = "13px";

                            for (var i = 0; i < selectArray1.length; i++) {
                                var option = document.createElement("option");
                                option.value = selectArray1[i];
                                option.text = selectArray1[i];
                                option.id = i;
                                select1.appendChild(option);
                            }

                            select1.onchange = function () {
                                var opt = this.options[this.selectedIndex].value;
                                if (opt == selectArray1[2]) {
                                    if (document.getElementById("radioButtonLabel" + this.parentElement.id).childElementCount == 0);
                                    document.getElementById("select" + this.parentElement.id).selectedIndex = -1;
                                    document.getElementById("select" + this.parentElement.id).style.display = "inline";
                                }
                                else {
                                    document.getElementById("select" + this.parentElement.id).style.display = "none";
                                    document.getElementById("radioButtonLabel" + this.parentElement.id).style.display = "none";

                                }
                            }

                            selectNumber.onchange = function () {
                                var number = this.options[this.selectedIndex].value;
                                addRadioButtonLabels(number, this.parentElement.id);
                            }


                            for (var k = 2; k <= 10; k++) {
                                var option = document.createElement("option");
                                option.value = k;
                                option.text = k;
                                selectNumber.appendChild(option);
                            }

                            for (var i = 0; i < selectArray2.length; i++) {
                                var option = document.createElement("option");
                                option.value = selectArray2[i];
                                option.text = selectArray2[i];
                                select2.appendChild(option);
                            }

                            selectNumber.style.display = "none";
                            selectNumber.style.marginLeft = "20px";
                            selectNumber.id = "select" + elementId;

                            select2.style.marginLeft = "20px";

                            addButton.type = "submit";
                            addButton.value = "+";
                            addButton.setAttribute("style", "width: 30px; height: 30px; font-size: 20px ; border-radius: 50%   ; background-color:#a39e9f; ");
                            addButton.style.marginLeft = "20px";
                            addButton.style.border = "none";
                            addButton.style.display = "none";

                            addButton.onclick = function () {
                                this.style.display = "none";
                                addElement();
                            };

                            elementContainer.class = "elContainer";
                            elementContainer.style.display = "block";
                            elementContainer.style.paddingLeft = "100px";
                            elementContainer.setAttribute("align", "left");
                            elementContainer.style.width = "80%";

                            saveButton1.style.display = "block";

                            elNumber++;

                            if (elementType == "Textbox")
                                select1.selectedIndex = 0;
                            else if (elementType == "Checkbox")
                                select1.selectedIndex = 1;
                            else if (elementType == "Radio buttons") {
                                select1.selectedIndex = 2;
                                selectNumber.style.display = "inline";
                                containerForLabels.style.display = "block";
                            }

                            if (validation == "Mandatory")
                                select2.selectedIndex = 0;
                            else if (validation == "None")
                                select2.selectedIndex = 1;
                            else if (validation == "Numeric")
                                select2.selectedIndex = 2;

                            if (elementType == "Radio buttons") {
                                for (var k = 0; k < arrayOfObjects.length; k++)
                                    if (arrayOfObjects[k].hasOwnProperty('buttonid')) {  // for each radio button got from base, create one 
                                        var button = Object.values(arrayOfObjects[k]);
                                        var buttonLabel = button[1];
                                        var buttonGroupId = button[2];
                                        var buttonInput = document.createElement("input");

                                        if (elementId === buttonGroupId) {  // if this radio button belongs to this group of radio buttons
                                            var n = containerForLabels.childElementCount + 1;
                                            if (buttonLabel != null)
                                                buttonInput.value = buttonLabel;
                                            else {
                                                buttonInput.placeholder = "Radio button label " + n;
                                            }
                                            buttonInput.style.marginLeft = "387px";
                                            buttonInput.style.marginTop = "0px";
                                            buttonInput.style.marginBottom = "2px";
                                            buttonInput.style.fontSize = "13px";

                                            containerForLabels.style.width = "700px";
                                            containerForLabels.style.display = "block";
                                            selectNumber.selectedIndex = containerForLabels.childElementCount - 1;  // for selecting number of existing radio buttons on selectNumber
                                            containerForLabels.appendChild(buttonInput); // append this radio button
                                        }
                                    }
                            }

                            row++;  // we created one row

                            panel1Container.appendChild(elementContainer);
                            elementContainer.appendChild(textnode);
                            elementContainer.appendChild(input);
                            elementContainer.appendChild(select1);
                            elementContainer.appendChild(selectNumber);
                            elementContainer.appendChild(select2);
                            elementContainer.appendChild(addButton);
                            elementContainer.appendChild(containerForLabels);
                        }

                        addButton.style.display = "inline";

                    }
                    else {
                        addElement();
                    }
                }
                else {
                    addElement();
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus); alert("Error: " + errorThrown);
            }
        });

        // getting radio button labels

        jQuery.ajax({
            type: "GET",
            url: 'http://localhost:3001/rbuttons',
            crossDomain: true,
            withCredentials: true,
            dataType: "jsonp",
            data: {
                formularName: document.getElementById("formularName").value
            },
            success: function (response) {
                var len = response.length;
                if (len != 0) {
                    for (var row = 0; row < len; row++) {
                        entry = response[row];
                        var input = document.createElement("input");
                        var container = document.getElementById(entry.elementId);

                        if (container != null) {
                            var n = container.childElementCount + 1;

                            input.type = "text";

                            if (entry.buttonlabel != null)
                                input.value = entry.buttonlabel;
                            else {
                                input.placeholder = "Radio button label " + n;
                            }

                            input.style.marginLeft = "387px";
                            input.style.marginTop = "0px";
                            input.style.marginBottom = "2px";
                            input.style.fontSize = "13px";

                            container.style.width = "700px";
                            container.style.display = "block";

                            document.getElementById("select" + entry.elementid).selectedIndex = container.childElementCount - 1;
                            container.appendChild(input);
                            container.style.display = "block";
                        }
                    }
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus); alert("Error: " + errorThrown);
            }
        });

    });


    jQuery("#saveButton1").click(function () {
        var divs = document.getElementById("panel1").children;
        var elements = [];

        //  we prepare the data for sending it into database
        for (var i = 0; i < divs.length; i++) {
            if (divs[i].children[1].value == "Radio buttons") {
                var divForLabels = divs[i].children[5].children;
                var rbLabels = [];
                for (var k = 0; k < divForLabels.length; k++) {
                    rbLabels.push({ rLabel: divForLabels[k].value });
                }

                elements.push({ label: divs[i].children[0].value, type: divs[i].children[1].value, validation: divs[i].children[3].value, rbLabels: rbLabels });
            }
            else {
                elements.push({ label: divs[i].children[0].value, type: divs[i].children[1].value, validation: divs[i].children[3].value });
            }
        }

        jQuery.ajax({
            type: "GET",
            url: 'http://localhost:3001/createFormular',
            crossDomain: true,
            withCredentials: true,
            dataType: "jsonp",
            data: {
                formularName: document.getElementById("formularName").value,
                element: elements
            },
            success: function () {
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus); alert("Error: " + errorThrown);
            }
        });
    });


    // -------- TAB 2 --------

    // show the second panel and get created formular names 
    jQuery("#formular").click(function () {
        showPanel(1);

        jQuery.ajax({
            type: "GET",
            url: 'http://localhost:3001/getFormularNames',
            crossDomain: true,
            withCredentials: true,
            dataType: "jsonp",
            success: function (response) {
                var select = document.getElementById("selectFormular");
                clearBox("selectFormular");
                var len = response.length;
                for (var row = 0; row < len; row++) {
                    entry = response[row];
                    var option = document.createElement("option");
                    option.value = (entry.formularname).substring(1, entry.formularname.length - 1);
                    option.text = (entry.formularname).substring(1, entry.formularname.length - 1);
                    select.appendChild(option);
                }
                select.selectedIndex = -1;
                select.style.width = "300px";

            }
        })
    });

    // load filled or blank forms
    jQuery("#loadButton").click(function () {
        var name = document.getElementById("selectFormular").value;
        var ver = document.getElementById("version").value;
        if (ver == "")
            ver = 0;

        jQuery.ajax({
            type: "GET",
            url: 'http://localhost:3001/getFilledFormular',
            crossDomain: true,
            withCredentials: true,
            dataType: "jsonp",
            data: {
                formularName: name,
                version: ver,
            },
            success: function (response) {
                entry = response[0];
                var arrayOfObjects = Object.values(entry)[0];  // objects received from database

                clearBox("panel2");

                if (arrayOfObjects != null) {
                    var len = arrayOfObjects.length;

                    // if array is not empty
                    if (len != 0) {
                        arrayOfObjects.sort(function (a, b) { return a.elementid - b.elementid });
                        var row = 0;
                        while (arrayOfObjects[row] != null && arrayOfObjects[row].hasOwnProperty('elementid')) {
                            var obj = Object.values(arrayOfObjects[row]);
                            var lab = obj[0];
                            var value = obj[1];
                            var elementId = obj[2];
                            var validation = obj[3];
                            var elementType = obj[4];

                            var elementContainer = document.createElement("div");

                            var label = document.createTextNode(lab);
                            var input = document.createElement("input");

                            elementContainer.appendChild(label);

                            if (validation == "Mandatory") {
                                label.nodeValue = lab + "*";
                                input.required = true;
                            }

                            if (elementType == "Textbox") {
                                if (validation == "Numeric")
                                    input.type = "numeric";
                                else
                                    input.type = "text";
                                input.value = value;
                                elementContainer.appendChild(input);
                            }


                            else if (elementType == "Radio buttons") {
                                var container = document.createElement("div");
                                container.style.marginBottom = "20px";
                                for (var k = 1; k < arrayOfObjects.length; k++)
                                    if (arrayOfObjects[k].hasOwnProperty('buttonid')) {
                                        var buttonContainer = document.createElement("div");
                                        var button = Object.values(arrayOfObjects[k]);
                                        var buttonid = button[0];
                                        var buttonLabel = button[1];
                                        var buttonValue = button[2];
                                        var buttonGroupId = button[3];
                                        var buttonInput = document.createElement("input");

                                        if (buttonValue)
                                            buttonInput.checked = true;
                                        else
                                            buttonInput.checked = false;

                                        if (validation == "Mandatory") {
                                            buttonInput.required = true;
                                        }

                                        if (buttonGroupId == elementId) {
                                            buttonContainer.appendChild(buttonInput);
                                            buttonContainer.appendChild(document.createTextNode(buttonLabel));
                                        }

                                        buttonInput.type = "radio";
                                        buttonInput.value = buttonValue;
                                        buttonInput.id = buttonid;
                                        buttonInput.name = "radioButton" + buttonGroupId;

                                        buttonInput.style.marginRight = "15px";
                                        buttonInput.style.marginLeft = "80px";

                                        container.appendChild(buttonContainer);
                                        container.id = buttonGroupId;
                                    }
                                elementContainer.appendChild(container);
                            }

                            else if (elementType == "Checkbox") {
                                input.type = "checkbox";
                                if (value)
                                    input.checked = true;
                                else
                                    input.checked = false;
                                elementContainer.appendChild(input);
                            }

                            input.id = elementId;
                            input.style.marginBottom = "20px";
                            input.style.marginLeft = "30px";

                            elementContainer.style.fontSize = "15px";
                            elementContainer.style.paddingLeft = "200px";
                            elementContainer.setAttribute("align", "left");

                            panel2Container.appendChild(elementContainer);
                            row++;
                        }

                    }
                    saveButton2.style.display = "block";
                } else
                    saveButton2.style.display = "none";

            }

        })
    })



    jQuery("#saveButton2").click(function () {
        var name = document.getElementById("selectFormular").value;
        var ver = parseInt(document.getElementById("version").value);
        var divs = document.getElementById("panel2").children;
        var elements = [];

        for (var i = 0; i < divs.length; i++) {
            if (divs[i].children[0].nodeName == "INPUT") {  // if textbox or checkbox
                var elem = divs[i].children[0];
                var id = elem.id;
                if (elem.type == "text") {
                    var type = "Textbox";
                    var elementValue = elem.value;
                }
                else {
                    var type = "Checkbox";
                    var elementValue;
                    if (elem.checked)
                        elementValue = true;
                    else
                        elementValue = false;
                }
                elements.push({ elementId: id, elementType: type, value: elementValue });  // push informations about textbox/checkbox
            }

            else if (divs[i].children[0].nodeName == "DIV") {  // else if radio buttons (each is stored into div, than in group div)
                var rbGroupDiv = divs[i].children[0];
                var rbGroupId = rbGroupDiv.id;
                var rButtons = [];

                if (rbGroupDiv.childElmentCount != 0) {
                    for (var k = 0; k < rbGroupDiv.childElementCount; k++) {
                        buttonDiv = rbGroupDiv.children[k];
                        if (buttonDiv.childElementCount != 0) {
                            for (var j = 0; j < buttonDiv.childElementCount; j++) {
                                var rb = buttonDiv.children[j];
                                var rbValue;
                                var rbId;
                                if (rb.checked)  // if checked send into database "true"
                                    rbValue = true;
                                else             // else send "false" 
                                    rbValue = false;
                                rbId = rb.id;
                                rButtons.push({ value: rbValue, id: rbId }); // we store infromations about radio button into array (value and id)
                            }
                        }
                    }
                }
                elements.push({ elementId: rbGroupId, elementType: "Radio buttons", buttons: rButtons }); // push whole element "Radio buttons"
            }
        }

        // send data
        jQuery.ajax({
            type: "GET",
            url: 'http://localhost:3001/fillFormular',
            crossDomain: true,
            withCredentials: true,
            dataType: "jsonp",
            data: {
                formularName: name,
                version: ver,
                element: elements
            },
            success: function () {
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus); alert("Error: " + errorThrown);
            }
        });
    }
    );

});