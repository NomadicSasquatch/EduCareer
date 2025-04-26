# Full-Stack E‑Learning & E‑Commerce Platform

This repository houses a unified, end‑to‑end solution for a modern E‑Learning/E‑Commerce platform—comprising a React/TypeScript frontend, Node.js/Express backend, MySQL database schema, and an AI‑powered chatbot integration. Each subdirectory contains its own detailed README; this top‑level guide provides a high‑level overview, installation steps, and workflow.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)  
2. [Components](#components)  
3. [Prerequisites](#prerequisites)  
4. [Getting Started](#getting-started)  
5. [Development Workflow](#development-workflow)  
6. [Testing](#testing)  

---

## Architecture Overview

- **Monolithic Repo** with three core services plus an AI chatbot service:  
  - **Frontend** (`/ecom_frontend`): React + TypeScript + Redux + Ant Design  
  - **Backend** (`/ecom_backend`): Node.js + Express + MySQL session store + Puppeteer  
  - **Database** (`/ecom_db`): MySQL schema, stored procedures, and seed data  
  - **AI Chatbot** (`/chatbot_service`): FastAPI + Gemini API + Tavily integration  

- **Docker‑First** deployment:  
  - Each service includes a production‑grade Dockerfile.  
  - Multi‑stage builds for optimized container size.  

- **Testing & CI**:  
  - **Mocha + Supertest** for backend integration tests  
  - **Jest** & **React Testing Library** for frontend unit/white‑box tests  
  - **Mochawesome** reports with auto‑generated CSV/HTML outputs  

---

## Components

| Folder                   | Description                                                                 | Entry Point / Docs                                    |
|--------------------------|-----------------------------------------------------------------------------|--------------------------------------------------------|
| **ecom_frontend/**       | Responsive React/TypeScript SPA with role‑based dashboards and chatbot UI.  | [README](./ecom_frontend/README.md)                   |
| **ecom_backend/**        | RESTful API server with authentication, file uploads, PDF generation, etc.  | [README](./ecom_backend/README.md)                    |
| **ecom_db/**             | MySQL DDL/DML scripts for schema creation, stored procedures, and seed data. | [README](./ecom_db/README.md)                         |
| **chatbot_service/**     | FastAPI microservice integrating Gemini API & Tavily for LLM‑driven chat.   | [README](./careerChatbotBackend/README.md)  |

---

## Prerequisites

- **Docker** ≥ 20.10 & **Docker Compose** ≥ 1.29  
- **Node.js** ≥ 16 LTS & **npm** ≥ 8  
- **MySQL** ≥ 8.0 (for local development without Docker)  
- **Python** ≥ 3.9 (for AI chatbot & FastAPI service)  

---

## Getting Started

1. Clone the repo
   ```bash
    git clone https://github.com/NomadicSasquatch/EduCareer.git
    cd EduCareer
2. Initialize submodules & install dependencies
   ```bash
    # Frontend
    cd ecom_frontend && npm install
    
    # Backend
    cd ../ecom_backend && npm install
    
    # Chatbot Service
    cd ../chatbot_service
    python -m venv venv                # Create virtual environment
    source venv/bin/activate            # Activate virtual environment
    pip install -r requirements.txt     # Install Python dependencies
3. Set up the database
   ```bash
    cd ../ecom_db
    mysql -u root -p < e_commSetup.sql
    mysql -u root -p ecom_db < helper_procedure.sql
    mysql -u root -p ecom_db < "Dummy Test Data New.sql"

## Development Workflow
- Frontend
  ```bash
    cd ecom_frontend
    npm start
- Backend
  ```bash
  cd ecom_backend
  npm run dev
- Chatbot Service
  ```bash
  cd chatbot_service
  uvicorn main:app --reload

## Testing
- Frontend Tests
  ```bash
  cd ecom_frontend
  npm test               
- Backend Tests
  ```bash
  cd ecom_backend
  npm test               
  npm run report:csv      
- Chatbot Service Tests
  ```bash
  cd chatbot_service
  pytest
