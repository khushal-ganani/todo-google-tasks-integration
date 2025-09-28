import LightningDatatable from 'lightning/datatable';

import customTodoTypeTemplate from './customTodoType.html';
import customTodoPriorityTemplate from './customTodoPriority.html';
import customTodoDueDateTemplate from './customTodoDueDate.html';
import customTodoEditPicklistTemplate from './customTodoPicklist.html';
import customTodoEditDateTime from './customTodoEditDateTime.html';

export default class TodoDatatable extends LightningDatatable {
    static customTypes = {
        customTodoType: {
            template: customTodoTypeTemplate,
            editTemplate: customTodoEditPicklistTemplate,
            standardCellLayout: true,
            typeAttributes: ['editOptions', 'editPicklistMissingValueMessage', 'editPlaceholder', 'context']
        },
        customTodoDueDate: {
            template: customTodoDueDateTemplate,
            editTemplate: customTodoEditDateTime,
            standardCellLayout: true,
            typeAttributes: ['context']
        },
        customTodoPriority: {
            template: customTodoPriorityTemplate,
            editTemplate: customTodoEditPicklistTemplate,
            standardCellLayout: true,
            typeAttributes: ['editOptions', 'editPicklistMissingValueMessage', 'editPlaceholder', 'context']
        }
    };
}