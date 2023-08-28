# Secure File Upload and Download Application

## Table of Contents

1. Introduction (Background)
2. Objective
3. Scope and Limitations
4. Result/Finding of Security Controls Implementation
   - 4.1 Implemented Security Controls
   - 4.2 Attack Prevention and Mitigation
5. Conclusion and Recommendation

## 1. Introduction (Background)

In today's digital age, the secure exchange of files over the internet has become increasingly important. The ability to upload and download files securely is crucial for users and organizations alike. The main goal of this project is to implement a secure file upload and download application using JavaScript and the Nest.js framework, focusing on cybersecurity controls and capabilities.

## 2. Objective

The objective of this project is to create a secure file upload and download application that meets the following requirements:

- Allows users to upload and download various types of files, such as PDFs, JPEGs, and PNGs. For this, we have specified the allowed file types and maximum file size limit of 10MB to control what is being uploaded.
- Ensures file size limits and user authentication and authorization are in place. For this, we have used JWT web tokens to authenticate users and authorize them to access protected routes.
- Implements security measures against common cyber attacks such as XSS, SQL injection, and directory traversal attacks. For this, we have used input validation and sanitization to prevent XSS and SQL injection. We have also implemented file encryption, integrity checks, and secure storage of credentials to mitigate various attacks.

Sure! Here's the updated version with the technologies used section added:

## . Technologies Used

- Frontend: HTML, CSS, JavaScript, PHP
- Backend: Node.js, Nest.js
- Database: MySQL
- Middleware: Multer
- algorithms: Aes (crypto js) for file encryption is preferred because of it's speed and simple interface ,
             - becrypt for password hashing and hmac for file integrity checking


## 3. Scope and Limitations

The scope of this project includes implementing the secure file upload and download application using JavaScript, HTML, CSS, PHP, Node.js, Nest.js, MySQL, and Multer middleware. The application ensures the specified requirements mentioned above. The limitations of this project are as follows:

- The application only supports certain file types (PDF, JPEG, and PNG) and has a maximum file size limit of 10 MB. The app can be extended to support more file types and larger file sizes.
- The application does not notify the admin when suspicious activities are detected. Instead, the admin must manually review logs to identify unauthorized access or malicious activity. An admin notification system can be implemented to alert admins of suspicious activities.
- Another limitation of the current implementation is that it uses hardcoded encryption keys for securing the uploaded files. This approach is not secure as it exposes the keys to potential attackers who can use them to decrypt the files. A more secure approach is to use dynamic encryption key management, where keys are generated and changed periodically using a secure key management system. Additionally, the keys should be communicated securely to authorized users and stored securely to prevent unauthorized access. This feature can be added to the application to improve its security and protect sensitive data.

## 4. Result/Finding of Security Controls Implementation

### 4.1 Implemented Security Controls

The following security controls were implemented in the application:

- File type and size validation using Multer middleware: This ensures only allowed file types and sizes are uploaded.
- User authentication and authorization using JWT web tokens: This is used to authenticate users and authorize access to protected routes.
- Input validation and sanitization to prevent XSS and SQL injection attacks using Nest.js's Class Validator and Prisma ORM: This is used to validate and sanitize input to prevent various code injection attacks.
- File encryption using AES (Crypto-js library): This is used to encrypt uploaded files and protect file contents.
- File integrity checks using HMAC: This is used to check the integrity of downloaded files and ensure the files have not been tampered with.
- Secure storage of user credentials using bcrypt for password hashing: This is used to securely hash and store user passwords.

### 4.2 Attack Prevention and Mitigation

The application successfully prevents and mitigates the following attacks:

- Unauthorized file uploads and downloads: Prevented through file type/size validation and user authentication.
- Directory traversal attacks: Prevented through input validation and sanitization.
- XSS and SQL injection attacks: Prevented through input validation and sanitization.
- Tampering of uploaded files: Prevented through file encryption and integrity checks.
- Unauthorized access to protected routes and endpoints: Prevented through user authentication and authorization.

## 5. Conclusion and Recommendation

The secure file upload and download application effectively implements the proposed project idea, incorporating the necessary cybersecurity controls and capabilities. However, there are some areas that could be improved upon for a more robust application:

- Admin notification system: Implement a system that automatically notifies the admin when suspicious activities are detected. This would help in timely identification of security threats and enable the admin to take appropriate action.
- Expand supported file types and size limits: The application could be extended to support additional file types and larger file sizes, making it more versatile and useful for a wider range of users.
- Continuous security testing and auditing: Regular security testing and audits should be performed to ensure that the application remains secure and up-to-date with the latest threatsand vulnerabilities.
- Move from hard-coded key management to dynamic encryption key management. This would ensure that the encryption keys used to secure the uploaded files are generated and changed periodically, using a secure key management system. This approach would provide better security for the application and protect sensitive data from potential attackers. Regular security testing and audits should also be performed to ensure that the encryption key management system is secure and up-to-date with the latest threats and vulnerabilities.

Developers:

- Fasika Fikadu: Backend Developer, email: fasikafikadu38@gmail.com
- Dagmawi Tensay: Frontend Developer, email: dagitensay@gmail.com
 
