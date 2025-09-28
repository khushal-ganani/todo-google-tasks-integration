import { LightningElement, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';

// To-Do schema
import TODO_PRIORITY_FIELD from '@salesforce/schema/To_Do__c.Priority__c';
import TODO_TYPE_FIELD from '@salesforce/schema/To_Do__c.Type__c';

// Lightning Message Service and a message channel
import { publish, MessageContext } from 'lightning/messageService';
import TODOS_FILTERED_MESSAGE from '@salesforce/messageChannel/TodosFiltered__c';

// The delay used when debouncing event handlers before firing the event
const DELAY = 350;

/**
 * Displays a filter panel to search for To-Do__c[].
 */
export default class TodoFilter extends LightningElement {
    searchKey = '';

    sortByValue = 'Due_Date__c ASC';

    get sortByOptions() {
        return [
            { label: 'Due Date (Early First)', value: 'Due_Date__c ASC' },
            { label: 'Due Date (Later First)', value: 'Due_Date__c DESC' },
            { label: 'To-Do Title (A to Z)', value: 'Name ASC' },
            { label: 'To-Do Title (Z to A)', value: 'Name DESC' },
        ];
    }

    filters = {
        searchKey: '',
        sortBy: 'Due_Date__c ASC',
    };

    @wire(MessageContext)
    messageContext;

    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: TODO_TYPE_FIELD
    })
    types

    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: TODO_PRIORITY_FIELD
    })
    priorities

    handleSearchKeyChange(event) {
        this.filters.searchKey = event.target.value;
        this.delayedFireFilterChangeEvent();
    }

    handleSortByChange(event) {
        this.sortByValue = event.detail.value;
        this.filters.sortBy = event.detail.value;

        publish(this.messageContext, TODOS_FILTERED_MESSAGE, {
            filters: this.filters
        });
    }


    handleCheckboxChange(event) {
        if (!this.filters.priorities) {
            // Lazy initialize filters with all values initially set
            this.filters.priorities = this.priorities.data.values.map((item) => item.value);
            this.filters.types = this.types.data.values.map((item) => item.value);
        }

        const value = event.target.dataset.value;
        const filterArray = this.filters[event.target.dataset.filter];
        if (event.target.checked) {
            if (!filterArray.includes(value)) {
                filterArray.push(value);
            }
        } else {
            this.filters[event.target.dataset.filter] = filterArray.filter(
                (item) => item !== value
            );
        }

        // Published To-DosFiltered message
        publish(this.messageContext, TODOS_FILTERED_MESSAGE, {
            filters: this.filters
        });
    }

    delayedFireFilterChangeEvent() {
        // Debouncing this method: Do not actually fire the event as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex
        // method calls in components listening to this event.
        window.clearTimeout(this.delayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(() => {
            // Published To-DosFiltered message
            publish(this.messageContext, TODOS_FILTERED_MESSAGE, {
                filters: this.filters
            });
        }, DELAY);
    }
}