import { LightningElement, api } from 'lwc';

export default class CustomCellTodoPriority extends LightningElement {

    label;
    priorityBadgeColor;

    @api
    get value() {
        return this.label;
    }

    set value(value) {
        this.label = value;
        this.priorityBadgeColor = this.getPriorityBadgeColor(value);
    }

    getPriorityBadgeColor(value){
        let colorBackground;
        let color;
        const priority = value;
        if(priority === "High"){
            colorBackground = 'rgb(255, 221, 221)';
            color = 'red'
        } else if(priority === "Medium"){
            colorBackground = 'rgb(255, 255, 181)';
            color = 'rgb(140, 140, 0)';
        } else if(priority === "Low"){
            colorBackground = 'rgb(181, 255, 181)';
            color = 'green';
        }
        return `--slds-c-badge-color-background: ${colorBackground}; --slds-c-badge-text-color: ${color};`
    }
}