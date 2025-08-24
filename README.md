# smart-contact-manager
# Smart Contact Manager 
An enhanced, full-stack contact management application built with modern technologies, offering a robust, secure, and user-friendly solution.

## Overview
**Smart Contact Manager 2.0** is a next-gen, end-to-end contact management application that enhances usability, performance, and security. Designed to allow users to efficiently manage their contacts—including photos, links, and cloud storage in the project.

## Key Features
- **CRUD Functionality**: Create, read, update, and delete contacts (including images and links)
- **Authenticated Access**: Secure login via OAuth with providers like Google or GitHub.  
- **Media Handling**: Supports uploading and showcasing contact photos/images.  
- **Form Handling & Validation**: Robust contact form support with field validation and error messaging 
- **Cloud Integrations**: Likely employs services such as Cloudinary for image storage, based on SCM best practices.  
- **Advanced Features**: The launch video flags upgraded technologies—suggesting there may be enhancements over the original SCM implementation.

## Tech Stack (inferred from SCM heritage)
While SCM2.0 specifics aren't fully detailed, the original SCM project typically used:
- **Backend**: Spring Boot, Spring Security, Hibernate, and MySQL database 
- **Frontend**: Thymeleaf, Bootstrap, Tailwind CSS, HTML, CSS, JavaScript
- **Build & Tools**: Maven for build automation, Docker/Docker Compose for containerization
- **Media & Email**: Integrated with Cloudinary for image storage and Mailtrap for email verification (from SCM baseline)

**Assumed SCM2.0 Enhancements**:
- Likely modernized UI with Tailwind CSS alongside or replacing Bootstrap.  
- Containerized deployment flows via Docker and `docker-compose` for easier setup 
- Possibly expanded OAuth integrations, enhanced image handling, and improved validation.

## Getting Started

### Prerequisites
- Java 17+  
- Maven 3.6+  
- MySQL or compatible SQL database  
- OAuth credentials (Google/GitHub)  
- Cloudinary credentials (if media storage is supported)  
- Mailtrap (or equivalent) configuration for email features  
- Docker & Docker Compose (optional, for containerization)

### Installation & Setup
1. **Clone the Repository**  
   ```bash
   git clone https://github.com/iamrautela/smart-contact-manager.git
   cd smart-contact-manager

