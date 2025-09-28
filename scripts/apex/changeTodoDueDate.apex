List<To_Do__c> todos = [SELECT Id, Name, Due_Date__c FROM To_Do__c];
for(To_Do__c todo : todos) {
    todo.Due_Date__c = todo.Due_Date__c.addMonths(19);
}
update todos;