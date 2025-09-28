@IsTest
public class TestTodoController {

    // load the initial To_Do__c object data 
    @TestSetup
    static void makeData(){
        TriggerHandler.bypass('TodoTriggerHandler');
        List<To_Do__c> todos = new List<To_Do__c>();
        for(Integer i = 1; i<=300; i++) {
            if(i<=100){
                todos.add(New To_Do__c(
                    Name = 'Test Todo '+i,
                    Priority__c = 'High',
                    Type__c = 'Other',
                    Due_Date__c = Datetime.now().addDays(i)
                ));
            } else if(i>100 && i<=200){
                todos.add(New To_Do__c(
                    Name = 'Test Todo '+i,
                    Priority__c = 'Medium',
                    Type__c = 'Other',
                    Due_Date__c = Datetime.now().addDays(i)
                ));
            } else {
                todos.add(New To_Do__c(
                    Name = 'Test Todo '+i,
                    Priority__c = 'Low',
                    Type__c = 'Other',
                    Due_Date__c = Datetime.now().addDays(i)
                ));
            }
        }
        insert todos;
        TriggerHandler.clearAllBypasses();
    }

    @isTest
    static void testGetTodoData() {

        // Test with valid filters (Positive Scenario)
        TodoController.Filters validFilters = new TodoController.Filters();
        validFilters.searchKey = 'Test';
        validFilters.types = new List<String>{'Other'};
        validFilters.priorities = new List<String>{'Medium'};
        validFilters.sortBy = 'Name ASC';
        Integer validPageSize = 10;
        Integer validPageNumber = 1;

        Test.startTest();
        TodoCardListData result = TodoController.getTodoData(validFilters, validPageSize, validPageNumber);
        Test.stopTest();

        System.assertNotEquals(null, result, 'No data was returned');
        System.assertEquals(validPageSize, (Integer)result.pageSize, 'valid page size was not returned');
        System.assertEquals(validPageNumber, (Integer)result.pageNumber, 'valid page number was not returned');
        System.assertEquals(100, (Integer)result.totalItemCount, 'total number of records were not 100');
        System.assertEquals(validPageSize, ((Object[])result.records).size(), 'Number of records returned is not same as valid page size');
        System.assertEquals('Test Todo 101', ((To_Do__c)result.records[0]).Name, 'The name of 1st record was not "Test todo 101"');
    }

    @IsTest
    static void testNegativeGetTodoData(){

        // Test with invalid filters (Negative scenario)
        TodoController.Filters invalidFilters = new TodoController.Filters();
        invalidFilters.searchKey = 'InvalidKey'; // No records should match this
        invalidFilters.types = new List<String>{'InvalidType'}; // No records should match this
        invalidFilters.priorities = new List<String>{'InvalidPriority'}; // No records should match this
        invalidFilters.sortBy = 'Name ASC'; // Invalid field
        Integer pageSize = 5;
        Integer pageNumber = 2;

        Test.startTest();
        TodoCardListData invalidResult = TodoController.getTodoData(invalidFilters, pageSize, pageNumber);
        Test.stopTest();
        
        System.assertEquals(pageSize, (Integer)invalidResult.pageSize, 'Some other page size received');
        System.assertEquals(pageNumber, (Integer)invalidResult.pageNumber, 'Some other page number received');
        System.assertEquals(0, (Integer)invalidResult.totalItemCount, 'total number of records were not 0');
        System.assertEquals(0, ((Object[])invalidResult.records).size(), 'Some records were returned');
    }

    @IsTest
    static void testUpdateTodos() {
        List<To_Do__c> todosToUpdate = [SELECT Id, Name, Priority__c, Type__c, Due_Date__c, Description__c, Completed__c FROM To_Do__c];
        for(To_Do__c todo : todosToUpdate) {
            todo.Description__c = 'Updated Description';
            todo.Completed__c = true;
        }

        Object updatedData = JSON.deserializeUntyped(JSON.serialize(todosToUpdate));
        Test.startTest();
        String updateResult = TodoController.updateTodos(updatedData);
        Test.stopTest();

        System.assertEquals(TodoController.TODOS_UPDATED, updateResult, 'The updateTodos method did not return the expected success message');
    }
}