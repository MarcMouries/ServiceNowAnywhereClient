// src/components/RecordView.js
import { EventEmitter } from '../EventEmitter.ts';
import { EVENT_USER_CLICKED_SAVE_BUTTON } from '../EventTypes';
import { EVENT_SYS_FETCHED_SINGLE_RECORD } from '../EventTypes';

const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            font-family: "Poppins", sans-serif !important;
            background-color: var(--content-color);
            padding: 15px;
            border-radius: var(--border-radius);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .header-row h2 {
            margin: 0;
            color: var(--text-dimmed-light);
        }
        .actions {
            display: flex;
            justify-content: flex-end;
            margin-left: auto;
        }
        .actions button {
            background-color: var(--primary-color);
            border: none;
            border-radius: var(--border-radius);
            color: var(--text-color);
            cursor: pointer;
            font-family: "Poppins", sans-serif !important;
            font-size: 1rem;
            padding: 6px 8px;
        }
        .form-container {
            padding: 15px;
            padding-bottom: 20px;
            line-height: 1.5;
            background-color: var(--container-color);
            border-radius: var(--border-radius);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        label {
            font-size: 0.9rem;
            font-weight: bold;
            color: var(--table-th-color);
        }
        input, textarea, select {
            padding: 8px;
            font-size: 0.9rem;
            border: 1px solid var(--table-border);
            border-radius: 5px;
        }
        button {
            margin-top: 15px;
            padding: 8px 12px;
            background-color: var(--primary-color);
            color: var(--text-color);
            border: none;
            border-radius: var(--border-radius);
            cursor: pointer;
        }
    </style>
    <div class="form-container"></div>
`;

class RecordView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.tableName = null;
        this.recordData = null;
    }

    connectedCallback() {
        console.log('RecordView component connected to the DOM');
        // Listen for the fetched single record event
        EventEmitter.on(EVENT_SYS_FETCHED_SINGLE_RECORD, (payload) => {
            console.log('RecordView received payload: ', payload);
            this.displayRecord(payload.table, payload.recordData);
        });
    }

    displayRecord(table, recordData) {
        console.log("RecordView: displayRecord", recordData);
    
        if (!recordData || !recordData.record) {
            console.error('No record data received to display.');
            return;
        }
    
        // Clear existing content in the form container
        const formContainer = this.shadowRoot.querySelector('.form-container');
        formContainer.innerHTML = '';
    
        // Create header and save button
        const headerRow = document.createElement('div');
        headerRow.classList.add('header-row');
        headerRow.innerHTML = `
            <h2>${table.label}</h2> 
            <div class="actions">
                <button id="save_record">Save</button>
            </div>
        `;
    
        // Append header to the form container
        formContainer.appendChild(headerRow);
    
        // Create the form
        const form = document.createElement('form');
        
        // Build and append form fields
        const builtForm = this.buildForm(table, recordData);
        form.appendChild(builtForm);
    
        // Append the form to the form container
        formContainer.appendChild(form);
    
        // Add event listener for the save button
        this.shadowRoot.querySelector('#save_record').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSave();
        });
    }
    

    buildForm(table, recordData) {
        const fragment = document.createDocumentFragment();
    
        recordData.schema.forEach(field => {
            const fieldType = this.getFieldType(field);
    
            const formGroup = document.createElement('div');
            formGroup.classList.add('form-group');
    
            const label = document.createElement('label');
            label.textContent = field.label;
    
            let input;
            if (fieldType === 'textarea') {
                input = document.createElement('textarea');
                input.value = recordData.record[field.name] || '';
            } else if (fieldType === 'select') {
                input = document.createElement('select');
                // Populate select options if necessary
            } else {
                input = document.createElement('input');
                input.type = fieldType;
                input.value = recordData.record[field.name] || '';
            }
    
            input.name = field.name;
    
            formGroup.appendChild(label);
            formGroup.appendChild(input);
            fragment.appendChild(formGroup);
        });
    
        return fragment;
    }
    

    getFieldType(field) {
        const typeMap = {
            'string': 'text',
            'integer': 'number',
            'text': 'textarea',
            'boolean': 'checkbox',
            // Add more mappings as needed
        };
        return typeMap[field.type] || 'text';
    }

    handleSave() {
        const formData = {};
        const inputs = this.shadowRoot.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            formData[input.name] = input.value;
        });

        EventEmitter.emit(EVENT_USER_CLICKED_SAVE_BUTTON, {
            tableName: this.tableName,
            recordData: formData,
        });
    }
}

customElements.define('record-view', RecordView);
