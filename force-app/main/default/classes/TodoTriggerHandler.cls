public class TodoTriggerHandler extends TriggerHandler {

    protected override void afterInsert() {
        // Call the future method for making Google Tasks API call to insert the Google Tasks
        insertGoogleTasks(getRecordIds(Trigger.new)); 
    }

    protected override void afterUpdate() {
        sObject todo = Trigger.old[0];
        if(todo instanceof To_Do__c && ((To_Do__c)todo).Google_Task_Id__c != null){
            // Call the future method for making Google Tasks API call to update the Google Tasks
            updateGoogleTasks(getRecordIds(Trigger.new));
        }
    }

    protected override void afterDelete() {
        Map<String, String> googleTaskDetailsMap = new Map<String,String>();
        for (SObject todo : Trigger.old) {
            if (todo instanceof To_Do__c) {
                googleTaskDetailsMap.put(((To_Do__c)todo).Google_Task_Id__c, getGoogleTaskListId(((To_Do__c)todo).Type__c));
            }
        }
        if (!googleTaskDetailsMap.isEmpty()) {
            // Call the future method for making Google Tasks API call to update the Google Tasks
            deleteGoogleTasks(googleTaskDetailsMap); 
        }
    }

    // future method to make callout to Google Tasks API to insert a Google Task
    @future(callout=true)
    public static void insertGoogleTasks(List<Id> todoIds) {

        // Query necessary information based on Ids
        List<To_Do__c> todoList = [SELECT Id, Name, Type__c, Description__c, Due_Date__c, Completed__c,
                                    Completed_On__c, Google_Task_Id__c FROM To_Do__c WHERE Id = :todoIds];

        // Make the callout using the retrieved data
        for (To_Do__c todo : todoList) {
            Http http = new Http();
            HttpRequest request = getHttpRequest(todo, TriggerOperation.AFTER_INSERT);

            HttpResponse jsonResponse = http.send(request);
            String responseBody = jsonResponse.getBody();

            GoogleTasksJSON response = GoogleTasksJSON.parse(responseBody);

            if (jsonResponse.getStatusCode() == 200) {
                todo.Google_Task_Id__c = response.id;
            } else {
                System.debug('Error occured in the callout: ' + responseBody);
            }
        }

        Database.SaveResult[] saveResult = Database.update(todoList, false);
        for(Database.SaveResult sr : saveResult) {
            if (!sr.isSuccess()) {
                for (Database.Error err : sr.getErrors()) {
                    System.debug('The following error has occured: ');
                    System.debug(err.getStatusCode() + ': ' + err.getMessage());
                    System.debug('Fields that affected this error: ' + err.getFields());
                }
            }
        }
    }

    // future method to make callout to Google Tasks API to update a Google Task
    @future(callout=true)
    public static void updateGoogleTasks(List<Id> todoIds) {

        // Query necessary information based on Ids
        List<To_Do__c> todoList = [SELECT Id, Name, Type__c, Description__c, Due_Date__c, Completed__c,
                                    Completed_On__c, Google_Task_Id__c FROM To_Do__c WHERE Id IN :todoIds];

        // Make the callout using the retrieved data
        for (To_Do__c todo : todoList) {
            Http http = new Http();
            HttpRequest request = getHttpRequest(todo, TriggerOperation.AFTER_UPDATE);

            HttpResponse jsonResponse = http.send(request);
            String responseBody = jsonResponse.getBody();

            if (jsonResponse.getStatusCode() != 200) {
                System.debug('Error occured in the callout to update Google Task: ' + responseBody);
            }
        }
    }

    @future(callout = true)
    public static void deleteGoogleTasks(Map<String, String> googleTaskDetailsMap) {

        // make callouts for each record that is being deleted
        for (String googleTaskId : googleTaskDetailsMap.keySet()) {

            Http http = new Http();
            HttpRequest request = new HttpRequest();

            request.setHeader('Accept', 'application/json');
            request.setMethod('DELETE');
            request.setTimeout(12000);

            // DELETE https://tasks.googleapis.com/tasks/v1/lists/{tasklist}/tasks/{task}
            request.setEndpoint('callout:googleTasks/tasks/v1/lists/' + googleTaskDetailsMap.get(googleTaskId) + '/tasks/' + googleTaskId);

            HttpResponse jsonResponse = http.send(request);

            if (jsonResponse.getStatusCode() != 204) {
                String responseBody = jsonResponse.getBody();
                System.debug('Error occured in deleting the Google Task in the callout: ');
                System.debug(responseBody);
            }
        }
    }

    /**
    * Method to create and return the HttpRequest object for the Insert and Update Trigger Callouts.
    */
    static HttpRequest getHttpRequest(To_Do__c todo, TriggerOperation operation) {

        HttpRequest request = new HttpRequest();

        if (operation == TriggerOperation.AFTER_INSERT || operation == TriggerOperation.AFTER_UPDATE) {
            GoogleTasksJSON taskObject = new GoogleTasksJSON();

            String taskListId = getGoogleTaskListId(todo.Type__c);
    
            // constructing the JSON body using the GoogleTasksJSON Wrapper class for the HttpRequest Object.
            taskObject.kind = 'tasks#task';
            taskObject.title = todo.Name;
            taskObject.notes = todo.Description__c;
            taskObject.status = getStatus(todo.Completed__c);
            // JSON.deserialize() method to convert the due date(Datetime type) in a String in the RFC 3339 timestamp format.
            taskObject.due = JSON.serialize(todo.Due_Date__c).replace('"', '');
            taskObject.deleted = false;
            taskObject.hidden = false;
            if (todo.Completed__c && todo.Completed_On__c != null) {
                //JSON.deserialize() method to convert the due date(Datetime type) in a String in the RFC 3339 timestamp format.
                taskObject.completed = JSON.serialize(todo.Completed_On__c).replace('"', '');
            }
            String body = JSON.serialize(taskObject, true);
    
            // assigning different properties of HttpRequest Object
            request.setHeader('Accept', 'application/json');
            request.setHeader('Content-Type', 'application/json');
            request.setBody(body);
            request.setTimeout(12000);
    
            // assigning different properties of HttpRequest based on type of TriggerOperation
            if (operation == TriggerOperation.AFTER_INSERT) {
                // POST https://tasks.googleapis.com/tasks/v1/lists/{tasklist}/tasks
                request.setMethod('POST');
                request.setEndpoint('callout:googleTasks/tasks/v1/lists/' + taskListId + '/tasks');
            } else if (operation == TriggerOperation.AFTER_UPDATE) {
                // PATCH https://tasks.googleapis.com/tasks/v1/lists/{tasklist}/tasks/{task}
                request.setMethod('PATCH');
                request.setEndpoint('callout:googleTasks/tasks/v1/lists/' + taskListId + '/tasks/' + todo.Google_Task_Id__c);
            }
        }
        return request;
    }

    /**
     * Method to return a List of Id of the To-Do object record List passed as argument
     */ 
    static List<Id> getRecordIds(List<To_Do__c> todos) {
        List<Id> recordIds = new List<Id>();
        for (To_Do__c todo : todos) {
            recordIds.add(todo.Id);
        }
        return recordIds;
    }

    /**
     * Method to return value of status property of the GoogleTaskJSON Wrapper class object based
     * on the value of Completed__c (Boolean) field in the To-Do object
     */
    static String getStatus(Boolean completed){
        String status;
        if(!completed){
            status = 'needsAction';
        } else if (completed) {
            status = 'completed';
        }
        return status;
    }

    /**
     * Method to return Google TaskList Id to be used in the Endpoint URL based on the Type__c field of the To-Do Object.
     * Google TaskList Id is a unique identifier for a Task List on the Google Tasks App which is required in the
     * Endpoint URL.
     */
    static String getGoogleTaskListId(String type) {
        String taskListId;
        if (type == 'Self'+'-'+'Improvement') {
            taskListId = 'OFp0ZFcyQnpBYWp3QXltTQ';
        } else {
            switch on type {
                when 'Personal' {
                    taskListId = 'MUs0SU11N1J3Z254RzZwVw';
                }
                when 'Work' {
                    taskListId = 'N2dMX3o3U1JFSDVPVnp2RQ';
                }
                when 'Academic' {
                    taskListId = 'ZWl6X2xZTFMweEpwY1VrZg';
                }
                when 'Health' {
                    taskListId = 'RkJsODVud3VIVjNXTi1TQg';
                }
                when 'Social' {
                    taskListId = 'YTBLLWcyZFZvQVZLMGl1Mw';
                }
                when 'Household' {
                    taskListId = 'RjB6SU1OWlU4MXJZc1B2Yg';
                }
                when 'Hobbies' {
                    taskListId = 'YzgzeGVqS0M5aU9GQU43VA';
                }
                when 'Other' {
                    taskListId = 'dXBKM09FZm1jODRZVlhBYQ';
                }
                when else {
                    taskListId = '';
                }
            }
        }    
        return taskListId;
    }
}