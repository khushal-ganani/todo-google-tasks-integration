import { LightningElement, api, wire, track } from 'lwc';

import getTodoData from '@salesforce/apex/TodoController.getTodoData';
import updateTodos from '@salesforce/apex/TodoController.updateTodos';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import { refreshApex } from '@salesforce/apex'
import { notifyRecordUpdateAvailable } from "lightning/uiRecordApi";

import TODO_OBJECT from '@salesforce/schema/To_Do__c'
import TODO_NAME_FIELD from '@salesforce/schema/To_Do__c.Name';
import TODO_TYPE_FIELD from '@salesforce/schema/To_Do__c.Type__c';
import TODO_PRIORITY_FIELD from '@salesforce/schema/To_Do__c.Priority__c';
import TODO_DUE_DATE_FIELD from '@salesforce/schema/To_Do__c.Due_Date__c';
import TODO_DESCRIPTION_FIELD from '@salesforce/schema/To_Do__c.Description__c';
import TODO_COMPLETED_FIELD from '@salesforce/schema/To_Do__c.Completed__c';

import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';

const COLUMNS = [
    {
        label: 'Title',
        fieldName: TODO_NAME_FIELD.fieldApiName,
        type: 'text',
        cellAttributes: {
            style: 'color: #55318a; font-weight: 700;'
        },
        editable: true,
    },
    {
        label: 'Type',
        fieldName: TODO_TYPE_FIELD.fieldApiName,
        type: 'customTodoType',
        editable: true,
        typeAttributes: {
            editOptions: { fieldName: "typeOptions" },
            editPicklistMissingValueMessage: 'Please Select a To-Do Type',
            editPlaceholder: 'Select To-Do Type',
            context: { fieldName: "Id" }
        }
    },
    {
        label: 'Priority',
        fieldName: TODO_PRIORITY_FIELD.fieldApiName,
        type: 'customTodoPriority',
        editable: true,
        typeAttributes: {
            editOptions: { fieldName: "priorityOptions" },
            editPicklistMissingValueMessage: 'Please Select a To-Do Priority',
            editPlaceholder: 'Select To-Do Priority',
            context: { fieldName: "Id" }
        }
    },
    {
        label: 'Due Date',
        fieldName: TODO_DUE_DATE_FIELD.fieldApiName,
        type: 'customTodoDueDate',
        editable: true,
        typeAttributes: {
            context: { fieldName: "Id" }
        },
    },
    {
        label: 'Description',
        fieldName: TODO_DESCRIPTION_FIELD.fieldApiName,
        type: 'text',
        cellAttributes: {
            style: 'color: #55318a'
        },
        editable: true,
    },
    {
        label: 'Completed?',
        fieldName: TODO_COMPLETED_FIELD.fieldApiName,
        type: 'boolean',
        editable: true,
    },
]

export default class CustomTodoDatatable extends LightningElement {
    columns = COLUMNS;
    todos = [];
    @track draftValues = [];
    error;
    pageNumber = 1;
    pageSize = 10;
    wireResult;
    priorityOptions = [];
    typeOptions = [];
    totalItemCount;
    isLoading = true;

    set filters(value) {
        this._filters = value;
        this.pageNumber = 1;
    }

    @api
    get filters() {
        return this._filters;
    }

    _filters = {
        sortBy: "Due_Date__c ASC"
    };

    @wire(getObjectInfo, { objectApiName: TODO_OBJECT })
    objectInfo

    @wire(getPicklistValues, {
        recordTypeId: "012000000000000AAA",
        fieldApiName: TODO_PRIORITY_FIELD
    })
    getPriorityPicklistValues({ data, error }) {
        if (data) {
            this.priorityOptions = data.values;
        } else if (error) {
            console.error('error while retreiving priority field picklist values: ', error);
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: "012000000000000AAA",
        fieldApiName: TODO_TYPE_FIELD
    })
    getTypePicklistValues({ data, error }) {
        if (data) {
            this.typeOptions = data.values;
        } else if (error) {
            console.error('error while retreiving type field picklist values: ', error);
        }
    }

    @wire(getTodoData, { filters: '$filters', pageNumber: "$pageNumber", pageSize: "$pageSize", priorityOptions: "$priorityOptions", typeOptions: "$typeOptions" })
    wiredData(result) {
        this.wireResult = result
        if (result.data) {
            this.totalItemCount = result.data.totalItemCount;
            let todos = result.data.records.map((result) => {
                let priorityOptions = this.priorityOptions;
                let typeOptions = this.typeOptions;
                return {
                    ...result,
                    priorityOptions: priorityOptions,
                    typeOptions: typeOptions,
                }
            })
            this.todos = todos;
            this.error = undefined;
            this.isLoading = false;
        } else if (result.error) {
            this.error = result.error;
            this.todos = undefined;
        }
    }

    get pageSizeOptions() {
        return [
            { label: '5', value: 5 },
            { label: '10', value: 10 },
            { label: '15', value: 15 },
            { label: '20', value: 20 },
            { label: '30', value: 30 },
        ];
    }

    handlePageSizeChange(event) {
        this.pageSize = event.detail.value;
        this.pageNumber = 1;
    }

    async handleSave(event) {
        this.isLoading = true;
        let updateDraftValues = event.detail.draftValues;

        // Prepare the record IDs for notifyRecordUpdateAvailable()
        const notifyChangeIds = updateDraftValues.map(row => { return { "recordId": row.Id } });

        try {
            // this.draftValues = [];
            const result = await updateTodos({ updatedData: updateDraftValues });

            const toastEvent = new ShowToastEvent({
                title: 'Records Updated',
                message: 'To-do Records were updated successfully!',
                variant: 'success'
            });
            this.dispatchEvent(toastEvent);

            //! Refresh LDS cache and wires
            //! notifyRecordUpdateAvailable(recordIds): Informs Lightning Data Service that record data has changed so 
            //! that Lightning Data Service can take the appropriate actions to keep wire adapters updated with the latest
            //! record data. Call this function to notify Lightning Data Service that a record has changed outside its 
            //! mechanisms, such as via imperative Apex or by calling User Interface API via a third-party framework. 
            //! This function supersedes getRecordNotifyChange(recordIds).
            notifyRecordUpdateAvailable(notifyChangeIds);

            this.draftValues = [];
            await refreshApex(this.wireResult);
        } catch (error) {
            console.error('InlineEditUsingApexController apex result error: ', error);
            this.draftValues = updateDraftValues;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating or refreshing the record!',
                    message: 'An unexpected error occurred: ' + error.message,
                    variant: 'error'
                })
            );
        } finally {
            this.isLoading = false;
        }
    }

    async handleRefresh() {
        await refreshApex(this.wireResult);
    }

    handlePreviousPage() {
        this.pageNumber -= 1;
    }

    handleNextPage() {
        this.pageNumber += 1;
    }

    get rowOffset() {
        return (this.pageNumber - 1) * this.pageSize;
    }
}