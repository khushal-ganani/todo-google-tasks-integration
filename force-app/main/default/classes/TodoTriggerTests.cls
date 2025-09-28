@isTest
public class TodoTriggerTests {
    private static Integer someId = 111;
    
    // Mock class for Google Tasks API callouts
    public class GoogleTasksMockHttpCallout implements HttpCalloutMock {
        private String operation;
        private Integer statusCode;
        private String responseBody;
        
        public GoogleTasksMockHttpCallout(String operation, Integer statusCode, String responseBody) {
            this.operation = operation;
            this.statusCode = statusCode;
            this.responseBody = responseBody;
        }
        
        public HTTPResponse respond(HTTPRequest request) {
            HttpResponse response = new HttpResponse();
            response.setHeader('Content-Type', 'application/json');
            response.setStatusCode(this.statusCode);
            response.setBody(this.responseBody);
            return response;
        }
    }
    
    @TestSetup
    static void setupTestData() {
        List<PermissionSetAssignment> permissions = [
            SELECT AssigneeId, PermissionSet.Name 
            FROM PermissionSetAssignment 
            WHERE PermissionSet.Name = 'To_Do_Manager_App' AND AssigneeId = :UserInfo.getUserId() 
            LIMIT 1
        ];
        if (permissions.isEmpty()) {
            PermissionSet ps = [SELECT Id FROM PermissionSet WHERE Name = 'To_Do_Manager_App' LIMIT 1];
            PermissionSetAssignment psa = new PermissionSetAssignment(
                AssigneeId = UserInfo.getUserId(),
                PermissionSetId = ps.Id
            );
            insert psa;
        }
        TriggerHandler.clearAllBypasses();
    }
    
    @isTest
    static void testAfterInsert_Success() {
        // Setup mock for successful Google Tasks API response
        String taskId = getTestId();
        String successResponse = '{"kind":"tasks#task","id":"' + taskId + '","title":"Test Personal Task","status":"needsAction"}';
        Test.setMock(HttpCalloutMock.class, new GoogleTasksMockHttpCallout('INSERT', 200, successResponse));
        
        // Create new To-Do record to trigger afterInsert
        To_Do__c newTodo = new To_Do__c(
            Name = 'New Task After Insert',
            Type__c = 'Academic',
            Description__c = 'New task for insert test',
            Due_Date__c = System.now().addDays(2),
            Completed__c = false,
            Priority__c = 'Medium'
        );
        
        Test.startTest();
        insert newTodo;
        Test.stopTest();
        
        // Verify the Google_Task_Id__c field was updated
        To_Do__c updatedTodo = [SELECT Id, Google_Task_Id__c FROM To_Do__c WHERE Id = :newTodo.Id];
        System.assertEquals(taskId, updatedTodo.Google_Task_Id__c, 'Google Task ID should be set');
    }
    
    @isTest
    static void testAfterInsert_Error() {
        // Setup mock for error response from Google Tasks API
        String errorResponse = '{"error":{"code":400,"message":"Bad Request"}}';
        Test.setMock(HttpCalloutMock.class, new GoogleTasksMockHttpCallout('INSERT', 400, errorResponse));
        
        To_Do__c newTodo = new To_Do__c(
            Name = 'New Task Error Test',
            Type__c = 'Health',
            Description__c = 'Task for error test',
            Due_Date__c = System.now().addDays(1),
            Completed__c = false,
            Priority__c = 'Low'
        );
        
        Test.startTest();
        insert newTodo;
        Test.stopTest();
        
        // Verify the Google_Task_Id__c field was not updated due to error
        To_Do__c updatedTodo = [SELECT Id, Google_Task_Id__c FROM To_Do__c WHERE Id = :newTodo.Id];
        System.assertEquals(null, updatedTodo.Google_Task_Id__c, 'Google Task ID should be null on error');
    }
    
    @isTest
    static void testAfterUpdate_WithGoogleTaskId() {
        createTestTodos();
        String taskId = getTestId();

        // Get existing test data
        TriggerHandler.byPass('TodoTriggerHandler');
        To_Do__c existingTodo = [SELECT Id, Name, Completed__c FROM To_Do__c WHERE Type__c = 'Personal' LIMIT 1];
        existingTodo.Google_Task_Id__c = taskId;
        update existingTodo;
        
        // Setup mock for successful update response
        String successResponse = '{"kind":"tasks#task","id":"' + taskId + '","title":"Updated Personal Task","status":"completed"}';
        Test.setMock(HttpCalloutMock.class, new GoogleTasksMockHttpCallout('UPDATE', 200, successResponse));
        TriggerHandler.clearAllBypasses();

        Test.startTest();
        existingTodo.Name = 'Updated Personal Task';
        existingTodo.Completed__c = true;
        update existingTodo;
        Test.stopTest();
        
        // Since this is a future method, we can't directly assert the callout result
        // But we can verify the update was processed without errors
        To_Do__c updatedTodo = [SELECT Id, Name, Completed__c FROM To_Do__c WHERE Id = :existingTodo.Id];
        System.assertEquals('Updated Personal Task', updatedTodo.Name, 'Task name should be updated');
        System.assertEquals(true, updatedTodo.Completed__c, 'Task should be marked as completed');
    }
    
    @isTest
    static void testAfterDelete_WithGoogleTaskId() {
        createTestTodos();
        // Setup test data with Google Task ID
        TriggerHandler.byPass('TodoTriggerHandler');
        To_Do__c todoToDelete = [SELECT Id FROM To_Do__c WHERE Type__c = 'Personal' LIMIT 1];
        todoToDelete.Google_Task_Id__c = getTestId();
        update todoToDelete;
        
        // Setup mock for successful delete response (204 status code)
        Test.setMock(HttpCalloutMock.class, new GoogleTasksMockHttpCallout('DELETE', 204, ''));
        TriggerHandler.clearAllBypasses();

        Test.startTest();
        delete todoToDelete;
        Test.stopTest();
        
        // Verify the record was deleted
        List<To_Do__c> deletedTodos = [SELECT Id FROM To_Do__c WHERE Id = :todoToDelete.Id];
        System.assertEquals(0, deletedTodos.size(), 'Todo should be deleted');
    }
    
    @isTest
    static void testAfterDelete_ErrorResponse() {
        createTestTodos();

        // Setup test data with Google Task ID
        TriggerHandler.byPass('TodoTriggerHandler');
        To_Do__c todoToDelete = [SELECT Id FROM To_Do__c WHERE Type__c = 'Work' LIMIT 1];
        
        // Setup mock for error delete response
        String errorResponse = '{"error":{"code":404,"message":"Task not found"}}';
        Test.setMock(HttpCalloutMock.class, new GoogleTasksMockHttpCallout('DELETE', 404, errorResponse));
        
        TriggerHandler.clearAllBypasses();

        Test.startTest();
        delete todoToDelete;
        Test.stopTest();
        
        // Verify the record was still deleted from Salesforce despite API error
        List<To_Do__c> deletedTodos = [SELECT Id FROM To_Do__c WHERE Id = :todoToDelete.Id];
        System.assertEquals(0, deletedTodos.size(), 'Todo should be deleted from Salesforce even if Google API fails');
    }

    static String getTestId() {
        return 'GOOGLE_TASK_ID_' + String.valueOf(someId++);
    }

    static void createTestTodos() {
        TriggerHandler.byPass('TodoTriggerHandler');
        
        // Create test To-Do records for different scenarios
        List<To_Do__c> testTodos = new List<To_Do__c>();
        
        testTodos.add(new To_Do__c(
            Name = 'Test Personal Task',
            Type__c = 'Personal',
            Description__c = 'Test personal task description',
            Due_Date__c = System.now().addDays(7),
            Completed__c = false,
            Priority__c = 'High',
            Google_Task_Id__c = getTestId()
        ));
        
        testTodos.add(new To_Do__c(
            Name = 'Test Work Task',
            Type__c = 'Work',
            Description__c = 'Test work task description',
            Due_Date__c = System.now().addDays(5),
            Completed__c = false,
            Priority__c = 'High',
            Google_Task_Id__c = getTestId()
        ));
        
        testTodos.add(new To_Do__c(
            Name = 'Test Self-Improvement Task',
            Type__c = 'Self-Improvement',
            Description__c = 'Test self improvement task',
            Due_Date__c = System.now().addDays(3),
            Completed__c = false,
            Priority__c = 'High',
            Google_Task_Id__c = getTestId()
        ));
        
        insert testTodos;
        TriggerHandler.clearAllBypasses();
    }
}