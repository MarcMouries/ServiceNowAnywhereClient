// src/components/RecordView.js
import { EventEmitter } from '../EventEmitter.ts';
import { EVENT_USER_CLICKED_SAVE_BUTTON } from '../EventTypes';

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
        .form-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
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

    setForm(table, formView, recordData = {}) {
        this.tableName = table.name;
        this.recordData = recordData;

        const formContainer = this.shadowRoot.querySelector('.form-container');
        formContainer.innerHTML = '';

        formView.elements.forEach(element => {
            const fieldType = this.getFieldType(element);
            const value = recordData[element.element] || '';

            const formGroup = document.createElement('div');
            formGroup.classList.add('form-group');

            const label = document.createElement('label');
            label.textContent = element.element; // You may want to replace this with a human-readable label

            let input;
            if (fieldType === 'textarea') {
                input = document.createElement('textarea');
            } else if (fieldType === 'select') {
                input = document.createElement('select');
                // Populate select options if necessary
            } else {
                input = document.createElement('input');
                input.type = fieldType;
            }

            input.name = element.element;
            input.value = value;

            formGroup.appendChild(label);
            formGroup.appendChild(input);
            formContainer.appendChild(formGroup);
        });

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.addEventListener('click', () => this.handleSave());
        formContainer.appendChild(saveButton);
    }

    getFieldType(element) {
        // This is a simplified example, you may need to expand this based on your data model
        const typeMap = {
            'string': 'text',
            'integer': 'number',
            'text': 'textarea',
            'boolean': 'checkbox',
            // Add more mappings as needed
        };
        return typeMap[element.type] || 'text';
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
