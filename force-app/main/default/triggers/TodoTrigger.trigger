trigger TodoTrigger on To_Do__c (after insert, after update, after delete) {

    // Instantiate the trigger handler
    TodoTriggerHandler handler = new TodoTriggerHandler();

    // Run the trigger handler
    handler.run();
}