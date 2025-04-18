# E-Commerce Project

This is a complete E-Commerce web application composed of three repositories:

- **Frontend**: [ecom_frontend](https://github.com/KCCHONG1997/ecom_frontend)
- **Backend**: [ecom_backend](https://github.com/KCCHONG1997/ecom_backend)
- **Database**: [ecom_db](https://github.com/KCCHONG1997/ecom_db)

## Recommend to Clone Directory in the Following Structure:

    .
    └── SC2006Proj/
        ├── ecom_backend
        ├── ecom_db
        └── ecom_frontend


## Repository Overview

### For this Repository: [ecom_frontend](https://github.com/KCCHONG1997/ecom_frontend)

The React/TypeScript-based frontend of the application. It provides the user interface for customers to interact with the system.

**Steps to Run:**

1. Clone the repository:

   ```bash
   git clone https://github.com/KCCHONG1997/ecom_frontend.git
   cd ecom_frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
4. Open http://localhost:3000 in your browser.

## Debug

### If something is already running on port 3000 (If you lose the active terminal that run localhost:3000)

1. Check what is on localhost:3000

   ```bash
   netstat -ano | findstr :3000
   ```

   you will get something like this: `TCP 0.0.0.0:3000 0.0.0.0:0 LISTENING 6196`

   `6196` is the PID here

2. Kill the task on localhost:3000
   ```bash
   taskkill/PID <yourPID> /F
   ```
