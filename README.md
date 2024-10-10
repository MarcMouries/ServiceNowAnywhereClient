# ServiceNow Anywhere Client



## Prerequisites

1. **Rust**: Ensure you have Rust installed. You can install Rust using `rustup`:

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2.  **Bun**:

    ```bash
    curl https://bun.sh/install | bash
    ```

3. **Tauri CLI**:

   ```shell
   cargo install tauri-cli
   ```

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/)
 + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
 + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
 + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).

## Setting up the Project

1. Clone the Repository:
   ```shell
   git clone https://github.com/MarcMouries/ServiceNowAnywhere.git
   cd ServiceNowAnywhere
   ```

2. Install Dependencies:

   ```shell
   bun install
   ```


# update project

1) need to cache reference data and the data can be large or reused across tables ( ex: sys_user)

https://marco.service-now.com/api/x_omni_server/service/data/x_omni_demo_inspct_reason?sys_id=cd57609633d4de104890955a7e5c7b98

ServiceNow Scripted REST APIs: Part 9 – PUT and PATCH


## To update
bun install @tauri-apps/cli@next @tauri-apps/api@next
cargo update



function getReferenceValues(referenceTable) {
    var references = [];
    var gr = new GlideRecord(referenceTable);
    gr.orderBy(gr.getDisplayName()); 
    gr.query();
   while (gr.next()) {
        references.push({
            sys_id: gr.getValue('sys_id'),
            display_value: gr.getDisplayValue()
        });
    }

    return references;
}

// Testing the getReferenceValues function in the background script

// Example table: sys_user (for testing purposes)
// Replace 'sys_user' with any reference table and provide valid sys_ids
var referenceTable = 'x_omni_demo_inspct_reason'; 

// Fetch the reference values
var result = getReferenceValues(referenceTable);

// Print the result to the logs
gs.info("Reference values: " + JSON.stringify(result, null, 4));


// Test the getChoices function for the 'incident' table and 'state' field
var tableName = 'x_omni_demo_inspct_inspection';
var fieldName = 'priority';

var parentTable = new GlideTableHierarchy(tableName).getRoot();
gs.info('Parent table: ' + parentTable);

// Call the getChoices function
result = getChoices(tableName, fieldName);

// Log the result to the system logs
gs.info("Choices for field " + fieldName + " in table " + tableName + " = " + JSON.stringify(result, null, 4));

 // Function to get the list view elements
    function getListView(tableName) {
        var listViewGR = new GlideRecord('sys_ui_list');
        listViewGR.addQuery('name', tableName);
        listViewGR.addQuery('view', "Default view");
        listViewGR.query();

        if (!listViewGR.hasNext()) {
            return {
                status: 'error',
                message: 'No list view found for the given table: ' + tableName,
                elements: []
            };
        }

        var result = {
            status: 'success',
            message: 'List view found for the given table.',
            elements: []
        };

        while (listViewGR.next()) {
            var sysId = listViewGR.sys_id.toString();

            var listElementGR = new GlideRecord('sys_ui_list_element');
            listElementGR.addQuery('list_id', sysId);
            listElementGR.orderBy('position');
            listElementGR.query();

            while (listElementGR.next()) {
                result.elements.push(listElementGR.element.toString());
            }
        }

        return result;
    }


	result = getListView("x_omni_demo_inspct_inspection");
	gs.info("getListView values: " + JSON.stringify(result, null, 4));


// get the choice list for a given field. if the field is not found on the current table, we search in its parent.
function getChoices(tableName, fieldName) {
    var choices = [];
    
    var choiceGR = new GlideRecord('sys_choice');
    choiceGR.addQuery('name', tableName);
    choiceGR.addQuery('element', fieldName);
    choiceGR.orderBy('value');
    choiceGR.query();

    while (choiceGR.next()) {
        choices.push({
            value: choiceGR.getValue('value'),
            label: choiceGR.getValue('label')
        });
    }

    if (choices.length === 0) {
        var parentTable = new GlideTableHierarchy(tableName).getRoot();
        if (parentTable) {
            return getChoices(parentTable, fieldName);
        }
    }

    return choices;
}

function getTableSchema(elements, tableName) {
    var columns = [];
    var gr = new GlideRecord(tableName);
    gr.setLimit(1); // We only need to retrieve one record to inspect the field types
    gr.query();

    if (gr.next()) {
        // Loop through the list view elements and construct the schema
        elements.forEach(function(element) {
            if (gr.isValidField(element)) {
                var field = gr.getElement(element);
                var column = {
                    name: element,
                    label: field.getLabel() || element, // Get field label if available, fallback to name
                    type: field.getED().getInternalType() // Get the internal field type
                };

                // Check if the field is a choice field
                if (field.getED().isChoiceTable()) {
                    column.is_choice = true; // Add a flag indicating the field is a choice
                }

                columns.push(column);
            } else {
                gs.error('Field "' + element + '" is not a valid field in table: ' + tableName);
            }
        });
    } else {
        gs.error('No records found in table: ' + tableName + ' to inspect fields.');
    }

    return {
        columns: columns
    };
}


result = getTableSchema(["reason", "state"], "x_omni_demo_inspct_inspection");
	gs.info("getTableSchema values: " + JSON.stringify(result, null, 4));
