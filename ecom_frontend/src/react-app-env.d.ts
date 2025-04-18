/// <reference types="react-scripts" />

declare namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_BACKEND_DEV_PORT: string;
      REACT_APP_BACKEND_PROD_PORT: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
  