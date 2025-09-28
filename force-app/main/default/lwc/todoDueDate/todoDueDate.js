import { LightningElement, api } from 'lwc';

export default class CustomCellTodoDueDate extends LightningElement {
    label = 'no value found!';

    @api
    get value() {
        return this.label;
    }

    set value(value) {
        this.label = this.formatDueDate(value);
    }

    formatDueDate(dueDate) {
        const options = { year: 'numeric', day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric', hour12: true };
        return new Intl.DateTimeFormat('en-US', options).format(new Date(dueDate));
    }
}