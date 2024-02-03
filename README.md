# Salesforce To-Do Manager with Google Tasks Integration 🖇️🌐🚀

---

## Overview

Welcome to the Salesforce To-Do Manager with Google Tasks Integration project! This solution builds upon the original To-Do Manager, now seamlessly integrating with the Google Tasks API. This integration empowers users to manage their tasks efficiently across both Salesforce and Google Task App.

👉 [Click here](https://github.com/khushal-ganani/todo-list) for an in-depth look at the original To-Do Manager Project.

## Problem Statement 

The initial To-Do Manager project provided a robust task management system within Salesforce. However, it lacked external synchronization, making it challenging for users to manage tasks seamlessly across different platforms. This project addresses that limitation by integrating Salesforce To-Do tasks with Google Tasks, allowing users to access and update their tasks from both environments.

## Project Video



https://github.com/khushal-ganani/todo-google-tasks-integration/assets/152521234/9425e4c8-9211-44ef-b818-800e48179a6a




## Key Features

### 1. Google Tasks API Integration 🌐

- **Bi-Directional Sync:** Achieved seamless synchronization between Salesforce To-Do tasks and Google Tasks, ensuring consistency across both platforms.
- **OAuth 2.0 Authorization:** Implemented secure `OAuth 2.0` authorization for Google API integration, enhancing the overall security of the application.

### 2. OAuth 2.0 Authorization Workflow 🔗

- **Secure Integration:** Implemented OAuth 2.0 authorization for secure communication between Salesforce and Google Tasks API.
- **console.google.com Setup:**
  - Created a project with OAuth consent screen defining Authorize domain URL, Google Scopes, and Test User email.
  - Generated `Client ID` and `Client Secret` to be used in Salesforce Auth. Providers.
- **Salesforce Auth. Providers Configuration:**
  - Created `Auth. Providers` in Salesforce, defining Client ID, Client Secret, Authorize Endpoint URL, Token Endpoint URL, Default Scopes, etc.
- **External Credentials, Named Principals, and Named Credential:**
  - Configured External Credentials, Named Principals, and Named Credential in Salesforce for Google OAuth 2.0 Authorization.
- **Secure Named Credential Storage:**
  - Leveraged Named Credentials to securely store and manage external system credentials within Salesforce.

This streamlined OAuth 2.0 Authorization process ensures a robust and secure connection between Salesforce and Google Tasks API, enabling seamless integration.

Here is the video for the OAuth 2.0 Authorization Setup :-



https://github.com/khushal-ganani/todo-google-tasks-integration/assets/152521234/44ff857a-4d6f-428a-9682-7af8abf2c5e8




### 2. JSON Parsing and Wrapper Class 📦

- **GoogleTasksJSON Class:** Developed a robust wrapper class `GoogleTasksJSON` for parsing JSON responses from the Google Tasks API and constructing the JSON request body to make Callout requests, facilitating easy handling of API data.

### 3. Postman Testing and Google App Script Integration 🤖

- **Postman Testing:** Thoroughly tested API calls (POST, PATCH, DELETE) to the Google Tasks API using `Postman`, ensuring the reliability of the integration.

Here is the video for the Testing of different HTTP requests to the Google Tasks API :-



https://github.com/khushal-ganani/todo-google-tasks-integration/assets/152521234/a9aedb51-238a-41f2-a81b-d918ad72057d





- **Google App Script:** Implemented Google App Script code to retrieve Google TaskList IDs, enhancing the overall efficiency of the integration.

[Click Here](https://script.google.com/d/1XSBEPUChsXE0bRTz3FD7MTL6v2R7nPkpJJfSp2xU-So1eIQWEo3IT87E/edit?usp=sharing) to view the Google App Script code to retreive the Google TaskList Id's.

### 4. Apex Callouts and Trigger Handlers 

- **Trigger Framework:** Utilized a robust `TriggerHandler` Framework to streamline the process of making Apex callouts from After Insert, After Update, and After Delete Triggers on the `To_Do__c` object to Insert, Update & Delete Google Tasks respectively.
- **Asynchronous Processing:** Implemented `@future` methods for making callouts to Google Tasks API, ensuring efficient and non-blocking execution.

## Technologies and Best Practices

- **Apex Trigger Handler Framework:** Utilized a robust framework for Trigger Handlers to maintain clean and organized trigger logic.
- **OAuth 2.0 Authorization:** Implemented secure authentication with Google Tasks API, following industry-standard `OAuth 2.0` practices.
- **Named Credentials:** Enhanced security by using Salesforce Named Credentials for storing and managing external system credentials.
- **JSON Parsing:** Developed a structured wrapper class `GoogleTasksJSON` for efficient parsing and handling of JSON responses from the Google Tasks API.
- **Postman Testing:** Ensured reliability through thorough testing of API calls using Postman.
- **Google App Script:** Improved efficiency with the integration of Google App Script code for retrieving Google TaskList IDs.


## Conclusion

The Salesforce To-Do Manager with Google Tasks Integration project brings a new level of efficiency and flexibility to task management. Users can now enjoy the benefits of synchronized tasks between Salesforce and Google Tasks, improving productivity and collaboration.

Thank you for exploring this project. For feedback or discussions, feel free to connect with me through LinkedIn or email.

## References

- [**Postman Quickstarts - Google OAuth in Postman**](https://quickstarts.postman.com/guide/google-oauth-in-postman/index.html?index=..%2F..index#:~:text=To%20do%20this%2C%20navigate%20to,%3A%20Select%20%22Authorization%20Code%22.) Postman Help article to setup OAuth 2.0 Authorization for Postman
- [**Google Tasks API reference:**](https://developers.google.com/tasks/reference/rest) Official documentation for the Google Tasks API.
- [**Salesforce Help - Configure a Google Authentication Provider:**](https://help.salesforce.com/s/articleView?id=sf.sso_provider_google.htm&type=5) Salesforce Help Article to configure Google as an authentication provider so users can log in to Salesforce using their Google credentials.
- [**Google Cloud Console:**](https://console.cloud.google.com/) Google Cloud Platform to build apps on Google
- [**Google OAuth 2.0 Playground:**](https://developers.google.com/oauthplayground/) Google Developers platform to help you understand the OAuth authorization flows and show each step of the process of obtaining an access token and sending requests to different Google APIs.
- [**Google App Script:**](https://script.google.com/home/start) Apps Script is a cloud-based JavaScript platform that lets you integrate with and automate tasks across Google products.
- [**Trigger Handler Framework by kevinohara80 on GitHub**](https://github.com/kevinohara80/sfdc-trigger-framework)
- [**Salesforce Help - Named Credentials and External Credentials in Salesforce**](https://help.salesforce.com/s/articleView?id=sf.nc_named_creds_and_ext_creds.htm&type=5)


## Contact

- **LinkedIn:** [**www.linkedin.com/in/khushal-ganani**](www.linkedin.com/in/khushal-ganani)
- **Email:** [**khushal.ganani@gmail.com**](mailto:khushal.ganani@gmail.com)
- **Trailhead:** [**https://www.salesforce.com/trailblazer/khushalg**](https://www.salesforce.com/trailblazer/khushalg)

## Getting Started

To experience the enhanced task management capabilities:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/khushal-ganani/todo-google-tasks-integration.git
   ```
