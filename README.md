# Resale-DataSg

A resale flat price analysis website for Singapore HDB resale transactions.

## Project structure

```
Resale-DataSg/
├── resale-datasg-backend/   # Java web backend (Maven, packaged as WAR)
└── resale-datasg-frontend/  # React frontend (Vite + TypeScript)
```

## Backend — `resale-datasg-backend`

A Maven-managed Java web application, packaged as a WAR for deployment to a servlet
container (e.g. Apache Tomcat).

**Prerequisites:** JDK, Maven

```bash
cd resale-datasg-backend
mvn clean package
```

This produces `target/resale-datasg-backend.war`, which can be deployed to a servlet
container such as Tomcat.

> The backend is currently a fresh Maven webapp scaffold with no application code yet.

## Frontend — `resale-datasg-frontend`

A React + TypeScript app built with Vite.

**Prerequisites:** Node.js, npm

```bash
cd resale-datasg-frontend
npm install
npm run dev      # start the dev server
npm run build    # production build
npm run lint      # lint with oxlint
```

> The frontend is currently the default Vite React-TS template with no application code yet.

## Development status

This project is in early scaffolding stage — the backend and frontend are set up but not
yet connected or implemented.
