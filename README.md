# PetBuddy 🐶

**By Group 2006-SCS4-59**

Welcome to the official repository for NTU SC2006 Software Engineering group project **PetBuddy**.

<p align="center">
    <a href="https://github.com/zijian980/2006_PetBuddy_FrontEnd_NextJS">Frontend</a>
    |
    <a href="https://github.com/zijian980/SC2006-PetBuddy-BackEnd">Backend</a>
    |
    <a href="https://youtu.be/L2OwSFCVsoI">Demo Video</a>
</p>

PetBuddy is the ultimate app for connecting pet owners with trusted, professional caretakers. Whether you need a dog walker, a cat sitter, or someone to care for your furry friend while you're away, PetBuddy makes finding reliable help easy and stress-free. Browse through profiles, read reviews, and book the perfect caretaker to ensure your pet gets the love and attention they deserve. With PetBuddy, peace of mind is just a tap away!

<details>
<summary>Demo Video</summary>
<br>

[YouTube Link](https://youtu.be/L2OwSFCVsoI)

</details>

<details>
<summary>Supporting Documentations</summary>
<br>

1. [Software Requirements Specification](https://github.com/zijian980/2006_PetBuddy_FrontEnd_NextJS/blob/main/Supporting-documents/Software%20Requirements%20Specification.pdf)
2. [User Interface Mockups](https://www.figma.com/design/aaBK5z7ghgqrfzBhoNjtxA/SC2006-UI-Mockup?node-id=58-2822&t=bCfb7Z1cK7qFdkKf-1)

</details>

<details>
<summary>Diagrams</summary>
<br>

1. [Key Boundary and Control Classes](https://github.com/zijian980/2006_PetBuddy_FrontEnd_NextJS/blob/main/Supporting-documents/keyboundaryandcontrollclass.jpg)
2. [Use Case Diagram](https://github.com/softwarelab3/2006-SCS4-59/blob/main/lab5/Use%20Case%20Diagram.jpg)
3. [Architecture Diagram](https://github.com/softwarelab3/2006-SCS4-59/blob/main/lab5/System%20Architecture.png)
4. [Class Diagram](https://github.com/zijian980/2006_PetBuddy_FrontEnd_NextJS/blob/main/Supporting-documents/classdiagram.jpg)
5. [Dialog Map](https://github.com/zijian980/2006_PetBuddy_FrontEnd_NextJS/blob/main/Supporting-documents/dialogmap.jpg)

</details>

<br>

**Table of Content**

- [PetBuddy 🐶](#petbuddy-)
- [Setup Instructions](#setup-instructions)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [API Docs](#api-docs)
- [App Design](#app-design)
  - [Frontend](#frontend-1)
  - [Backend](#backend-1)
  - [Tech Stack](#tech-stack)
- [External APIs](#external-apis)
- [Contributors](#contributors)

# Setup Instructions

## Frontend

1. Navigate to the [frontend directory](https://github.com/softwarelab3/2006-SCS4-59/tree/main/lab5/Application%20Code/Frontend), download it and open a terminal at its root
2. Install the neccessary packages
```
npm install
```
3. Once done, start the app by typing
```
npm run dev
```

IMPORTANT: Make sure the backend is running as well. Refer to the backend section for more details.

4. Ctrl+Click on the [http://localhost:3000] to view the app on the web!
5. For movile view, right click the web page and select inspect element
6. Ctrl+shift+M to change from webview to mobile view.

## Backend

1. Navigate to the [backend directory](https://github.com/softwarelab3/2006-SCS4-59/tree/main/lab5/Application%20Code/Backend), download it and open a terminal at its root
2. create a venv by typing
```
python -m venv .venv
```
3. select the python venv intepreter e.g. Python 3.12.6('venv':venv)
4. activate the virtual environment.
```
.venv/Scripts/activate
```
5.  You should see in the terminal that (venv) is infront of your directory eg (venv)c:/user/...
6. Install the neccessary packages
```
pip install -r requirements.txt
``` 
6. Once done, you are ready to run the backend
```
uvicorn app.main:app --reload
```

IMPORTANT: Make sure the frontend is running as well. Refer to the frontend section for more details.

7. You should be able to see that "Uvicorn running on http://127.0.0.1:8000" this is where the backend will be running
8. It is running correctly if you are able to see this in the terminal.
```
INFO:     Application startup complete.
```

# API Docs

The PetBuddy Backend application uses FastAPI, which comes with an in-built documentation and testing functionality for API routes created. You may access it via http://127.0.0.1:8000/docs/ after activating the backend

# App Design

## Frontend

The frontend (React.js) mainly consists of the different **User Interfaces** (Screens), which can be found as page.tsx within named folders in src/app. Some of the pages are nested as they are linked to each other, such as the `/search` directory which consists of displaying caretakers and their individual service pages which can then be booked and paid for. TabbedMenu.tsx is a component that displays a navigation bar and notifications button and persists throughout the app after the user is logged in. It is put in the layout.tsx file in the root directory.

## Backend

- `📁 app/models`
  - Contains the columns of each table and their data types and relationships with other tables if any
- `📁 app/controllers`
  - Controllers that uses the various services implemented in the `app/services` directory.
  - They implements the Facade Pattern by masking the more complex underlying implementation details from the frontend.
- `📁 app/routers`
  - Routers that implements REST API endpoints for communication between frontend and backend. They allow the frontend to use the controllers in the backend.
  - Routers use the controllers implemented in the `app/controllers` directory.
- `📁 app/schemas`
  - Defines all the request and response fields that are passed between the app and database.
- `📁 app/database.py`
  - Entry point to database that will store all the business objects.
- `📁 app/websocket.py`
  - Implements the Publisher-Subscriber Pattern via websockets for real-time text messaging communication between different users.

## Tech Stack

**Frontend:**

- React.js: Core framework for building the user interface
- Next.js: For routing and server side rendering
- TypeScript: For type safety
- Axios: For making HTTP requests to the backend
- TailwindCSS: For styling

**Backend:**

- FastAPI: Main web framework for your API
- Uvicorn: Backend server to run FastAPI
- Python: Language to code and define the database with packagaes like sqlalchemy
- MySQL: The foundation of the database

# External APIs

1. **Google Calendar**
   1. [Google Calendar API Docs](https://developers.google.com/calendar/api/guides/overview)
2. **Google Maps**
   1. [Google Map API Docs](https://developers.google.com/maps/documentation/javascript/overview)
3. **Eventbrite API**
   1. [Eventbrite API Docs](https://www.eventbrite.com/platform/api)

# Contributors

The following contributors have contributed to the whole Software Developement Life-cycle, including (not exhausive):

1. Ideation and refinement
2. Generation of functional and non-funtional requirements
3. Generation of Use Cases and Descriptions
4. UI/UX Mockup and Prototyping (Figma)
5. Design of Architecture Diagram, Class Diagram, Sequence Diagrams, and Dialog Map Diagram
6. Development of Application
7. Black-box and White-box Testing
8. Documentations

| Name                   | Role       |
| -----------------------|----------- |
| Koh Jia Xin            | Backend    |
| Krystal Pek Ke Yun     | Backend    |
| Juannisa Putri Sunarya | Frontend   |
| Chan Zi Jian           | Frontend   |
| Long Ming Wei          | Frontend   |
