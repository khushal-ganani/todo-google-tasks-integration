import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import TO_DO_OBJECT from '@salesforce/schema/To_Do__c';
import TO_DO_NAME_FIELD from '@salesforce/schema/To_Do__c.Name';
import TO_DO_TYPE_FIELD from '@salesforce/schema/To_Do__c.Type__c';
import TO_DO_PRIORITY_FIELD from '@salesforce/schema/To_Do__c.Priority__c';
import TO_DO_DUE_DATE_FIELD from '@salesforce/schema/To_Do__c.Due_Date__c';
import TO_DO_DESCRIPTION_FIELD from '@salesforce/schema/To_Do__c.Description__c';

import QouteGenerator from './quoteGenerator';

const fields = [
  TO_DO_NAME_FIELD, TO_DO_TYPE_FIELD, TO_DO_PRIORITY_FIELD, TO_DO_DUE_DATE_FIELD, TO_DO_DESCRIPTION_FIELD
];

const fieldApiNames = fields.map((arr) => arr.fieldApiName); // array of field api names

export default class TodoHeader extends LightningElement {
  greeting = "Good Morning";
  time = "9:00 AM";
  objectApiName = TO_DO_OBJECT;
  quote;

  quoteGenerator = new QouteGenerator();

  Name; Type; Priority; Due_Date; Description;

  // standard public property to get component size
  // value can be SMALL, MEDIUM, LARGE based on current context
  @api flexipageRegionWidth;

  connectedCallback() {
    this.setRandomQuote(); // set the quote of the day

    // assigning the field api names
    [this.Name, this.Type, this.Priority, this.Due_Date, this.Description] = fieldApiNames;
    let seconds = this.getTime();

    setInterval(() => {
      seconds = this.getTime();
    }, (60 - seconds));
  }

  //* return greeting based on current hour
  setGreeting(hour) {
    if (hour < 12) {
      this.greeting = "Good Morning! 🌅";
    } else if (hour >= 12 && hour < 17) {
      this.greeting = "Good Afternoon! ☀️";
    } else {
      this.greeting = "Good Evening! 🌇";
    }
  }

  //* get time in the 12 hour format
  getTime() {
    const date = new Date();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    this.time = `${this.getHour(hour)}:${this.getInDoubleDigits(minute)} ${this.getMidDay(hour)}`;
    this.setGreeting(hour);

    return second;
  }

  //* Convert 24 hours format to 12 hours format
  getHour(hour) {
    if (hour == 0) {
      return 12;
    } else if (hour > 12) {
      return hour - 12;
    } else {
      return hour;
    }
  }

  //* Convert single digit number of minutes to double digit minute number
  getInDoubleDigits(minute) {
    return minute < 10 ? "0" + minute : minute;
  }

  //* return AM or PM based on time
  getMidDay(hour) {
    return hour >= 12 ? "PM" : "AM"
  }

  //* Get input box size based on current screen width
  get largePageSize() {
    return this.flexipageRegionWidth === "SMALL"
      ? "12"
      : this.flexipageRegionWidth === "MEDIUM"
        ? "8"
        : "6";
  }

  // method to set random quote of the day.
  setRandomQuote() {
    this.quote = this.quoteGenerator.getRandomQuote();
  }

  //* actions to perform when To-Do record is submitted
  handleSubmit(event) {
    event.preventDefault();  // stop the form from submitting
    const fields = event.detail.fields;
    this.template.querySelector('lightning-record-edit-form').submit(fields);
  }

  //* actions to perform when record is succesfully created
  handleSuccess(event) {
    const newRecord = event.detail;

    const toastMessage = `${newRecord.fields.Name.value} To-Do Task created.`
    // Delay the execution of ShowToastEvent with a timeout
    // This modification adds a small delay (0 milliseconds) using setTimeout. This is a common technique in JavaScript
    // to allow the browser to finish its current execution cycle before proceeding with the specified function.
    setTimeout(() => {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "To-Do Task created",
          message: toastMessage,
          variant: "success",
          mode: "sticky"
        })
      );
    }, 0);
  }

  // actions to perform in case of error in creating To-Do record
  handleError(event) {
    const errorMessages = event.detail.message || [];
    console.error('onerror: ', errorMessages);

    this.dispatchEvent(
      new ShowToastEvent({
        title: "Error Creating To-Do Task",
        message: errorMessages.join(', '), // Display multiple error messages if available
        variant: "error",
        mode: "sticky"
      })
    );
  }
}