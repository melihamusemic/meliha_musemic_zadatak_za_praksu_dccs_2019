
// function created for showing first or second panel(tab)
function showPanel(panelIndex) {
    tabButtons.forEach(function (node) {
        node.style.backgroundColor = "";
        node.style.color = "";
    });

    tabButtons[panelIndex].style.backgroundColor = "#d5d8d1";

    tabPanels.forEach(function (node) {
        node.style.display = "none";
    });

    tabPanels[panelIndex].style.backgroundColor = "#d5d8d1";
    tabPanels[panelIndex].style.display = "block";
}


// function used for removing children from some element
function clearBox(elementID) {
    var div = document.getElementById(elementID);
    elNumber = 1;

    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
}



// ----- FUNCTIONS FOR PANEL 1 -----

// with this function we add one row (elementContainer) to first(Administration) tab
function addElement() {
    var elementContainer = document.createElement("div"); // div used for storing textnode, textfield, three selections and button 
    var containerForLabels = document.createElement("div"); // div used for storing textfields which are used for inputing radio button labels
    var input = document.createElement("input");    // textfield
    var textnode = document.createTextNode("Element " + elNumber + " :"); // textnode for printing element count
    var select1 = document.createElement("select");  // select used for element type
    var select2 = document.createElement("select"); // select used for validation 
    var selectNumber = document.createElement("select"); // select used for selection number of radio buttons in that group 
    var addButton = document.createElement("input"); // button (+) for adding next row
    var selectArray1 = ["Textbox", "Checkbox", "Radio buttons"]; //  array used for select1
    var selectArray2 = ["Mandatory", "None", "Numeric"]; // array used for select2

    containerForLabels.className = "radioButtonLabels";
    containerForLabels.classList.add("hide");
    containerForLabels.id = "radioButtonLabel" + elNumber;

    input.type = "text";
    input.placeholder = "Label " + elNumber;
    input.style.fontSize = "13px";

    // adding options to select1
    createSelect(select1, selectArray1);

    select1.selectedIndex = -1; // nothing is selected

    select1.onchange = function () {
        var opt = select1.options[select1.selectedIndex].value;
        if (opt == selectArray1[2]) {        // if radio buttons group is selected -> show the select for numbers
            selectNumber.style.display = "inline";
            selectNumber.selectedIndex = -1;
        }
        else {                              // else select and container for labels are  hidden
            selectNumber.style.display = "none";
            containerForLabels.style.display = "none";
        }
    }

    // adding options to selectNumber (numbers 2-10)
    createSelectNumber(selectNumber);

    selectNumber.onchange = function () {
        var number = selectNumber.options[selectNumber.selectedIndex].value;  // selected number
        addRadioButtonLabels(number, selectNumber.id);  // function call for adding textfields for radio button labels
    }

    // adding options to select2
    createSelect(select2, selectArray2);

    // attribute settings 
    selectNumber.className = "selectNumber";
    selectNumber.selectedIndex = -1;
    selectNumber.id = elNumber;

    select2.className = "select2";
    select2.selectedIndex = -1;

    createAddButton(addButton);

    elementContainer.className = "elContainer";

    saveButton1.classList.add("show");  // show save button when element is added

    panel1Container.appendChild(elementContainer);
    elementContainer.appendChild(textnode);
    elementContainer.appendChild(input);
    elementContainer.appendChild(select1);
    elementContainer.appendChild(selectNumber);
    elementContainer.appendChild(select2);
    elementContainer.appendChild(addButton);
    elementContainer.appendChild(containerForLabels);

    elNumber++;   // incrementing number of elements

}

// function for adding textfields for radio button labels
function addRadioButtonLabels(number, id) {
    var elementContainer = document.getElementById("radioButtonLabel" + id);
    var k = elementContainer.childElementCount - number;

    // if number (selected) is smaller than number of existing labels
    if (k > 0) {
        while (k > 0) {
            elementContainer.removeChild(elementContainer.lastChild);
            k--;
            rblNumber--;
        }
    }
    else {
        for (var i = 1; i < 1 - k; i++) {
            var input = document.createElement("input");
            var n = elementContainer.childElementCount + 1;

            input.type = "text";
            input.placeholder = "Radio button label " + n;
            input.className = "rbLabel";

            elementContainer.classList.add("show");

            elementContainer.appendChild(input);

            rblNumber++;
        }
    }
}

function createSelect(select1, selectArray1) {
    for (var i = 0; i < selectArray1.length; i++) {
        var option = document.createElement("option");
        option.value = selectArray1[i];
        option.text = selectArray1[i];
        option.id = i;
        select1.appendChild(option);
    }
}

function createSelectNumber(selectNumber) {
    for (var k = 2; k <= 10; k++) {
        var option = document.createElement("option");
        option.value = k;
        option.text = k;
        selectNumber.appendChild(option);
    }
}

function createAddButton(addButton) {
    addButton.value = "+";
    addButton.className = "addButton";

    addButton.onclick = function () {
        this.style.display = "none"; // addButton is hidden in this row
        addElement(); // adding next row
    };
}

window.onload = function () {
    tabButtons = document.querySelectorAll(".tab .buttons button"); // array of fabs
    tabPanels = document.querySelectorAll(".tab .panel");  // panels in tabs (one in each)
    panel1Container = document.createElement("div");   //  container for all rows (Element1 ... Element n)  in panel 1
    panel2Container = document.createElement("div");  // container for all rows (Element1 ... Element n)  in panel 2
    elNumber = 1; // counter used for element counting
    rblNumber = 1; // counter used for counting radio button labels
    ver = document.getElementById("version");
    saveButton1 = document.getElementById("saveButton1"); // save button on first tab
    saveButton2 = document.getElementById("saveButton2");  // save button on second tab

    ver.className = "version";

    // setting ids for panels
    panel1Container.id = "panel1";
    panel2Container.id = "panel2";

    tabPanels[0].appendChild(panel1Container);
    tabPanels[1].appendChild(panel2Container);

    tabPanels[0].appendChild(saveButton1);
    tabPanels[1].appendChild(saveButton2);

    // the panel1 is shown first
    showPanel(0);
};