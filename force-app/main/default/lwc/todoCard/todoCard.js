import { LightningElement, api } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class TodoCard extends LightningElement {

    // properties of todo record
    toDoRecord;
    recordId;
    cardTitle;
    dueDate;
    description;
    priorityBadgeLabel;
    typeBadgeLabel;
    completedState = false;
    priorityBadgeColor;
    iconName;

    @api
    get todo() {
        return this.toDoRecord;
    }

    set todo(value) {
        this.toDoRecord = value;
        this.recordId = value.Id;
        this.cardTitle = value.Name;
        this.dueDate = this.formatDueDate(value.Due_Date__c); // Format the Due Date
        this.description = value.Description__c;
        this.priorityBadgeLabel = value.Priority__c;
        this.typeBadgeLabel = value.Type__c;
        this.completedState = value.Completed__c;
        this.priorityBadgeColor = this.getPriorityBadgeColor(value.Priority__c);
        this.iconName = this.getIconName(value.Type__c);
    }

    //* method to format due date
    formatDueDate(dueDate) {
        const options = { day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric', hour12: true };
        return new Intl.DateTimeFormat('en-US', options).format(new Date(dueDate));
    }

    // method to return the name of icon based on the type of to-do task
    getIconName(value) {
        const type = value;
        // different icons for To-Do cards with following types: Personal, Work, Academic, Health, Social, Household,
        // Hobbies, Self-Improvement, Other.
        switch (type) {
            case "Personal":
                return "utility:socialshare";
            case "Work":
                return "utility:company";
            case "Academic":
                return "utility:knowledge_base";
            case "Health":
                return "utility:center_align";
            case "Social":
                return "utility:groups";
            case "Household":
                return "utility:home";
            case "Hobbies":
                return "utility:brush";
            case "Self-Improvement":
                return "utility:trending";
            case "Other":
                return "utility:task";

            default:
                console.warn('Unexpected or undefined todo type:', type);
                return "utility:task"; // Default icon for unexpected types
        }
    }

    /** 
    * method to dynamically return the background and text color of the badge based on the
    * priority of the to-do
    */
    getPriorityBadgeColor(value) {
        let colorBackground;
        let color;
        const priority = value;
        if (priority === "High") {
            colorBackground = 'rgb(255, 200, 200)';
            color = 'red'
        } else if (priority === "Medium") {
            colorBackground = 'rgb(255, 255, 181)';
            color = 'rgb(140, 140, 0)';
        } else if (priority === "Low") {
            colorBackground = 'rgb(181, 255, 181)';
            color = 'green';
        }
        return `--slds-c-badge-color-background: ${colorBackground}; --slds-c-badge-text-color: ${color};`
    }

    /**
     * method to handle the onclick button event to update the to-do records Completed__c field
     */
    async handleCompletion(event) {
        let completed;
        try {
            completed = this.completedState;
            const recordInput = { fields: { Id: this.recordId, Completed__c: !completed } };
            const result = await updateRecord(recordInput)
            this.completedState = !completed;

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: `To-Do ${completed ? 'unmarked' : 'marked'} as completed.`,
                    variant: 'success',
                })
            );
        } catch (error) {
            console.error('Error updating record: ', error.body.message);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'An error occurred while updating the record.',
                    variant: 'error',
                })
            );
        }
    }
}