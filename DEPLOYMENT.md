# Deployment Guide

This project deploys as two Render web services and one Redis instance:

- `agentflow-api`: Express API and Socket.IO server
- `agentflow-client`: Next.js frontend
- `agentflow-redis`: BullMQ queue backend

MongoDB is supplied through MongoDB Atlas (or another hosted MongoDB provider).

## 1. Prepare the repository

Install Git if it is not already installed, then run these commands from the project root:

```bash
git init
git add .
git commit -m "Prepare Agentflow AI for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Replace the remote URL with your GitHub repository URL. Do not commit `.env` files or real API keys.

## 2. Create the hosted database

Create a MongoDB Atlas database and copy its connection string. Make sure its network access rules allow connections from Render. Keep the connection string private.

## 3. Create the Render services

1. In Render, choose **New +** and **Blueprint**.
2. Connect the GitHub repository.
3. Select the repository root. Render will read `render.yaml`.
4. Enter a strong value for `MONGO_URI` when prompted.
5. Set `CLIENT_URL` to the final frontend URL, for example `https://agentflow-client.onrender.com`.
6. Deploy the Blueprint.

The file uses `https://agentflow-api.onrender.com` as the default API hostname. If Render assigns a different hostname, update both `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` on `agentflow-client`, then redeploy the client. Also update `CLIENT_URL` on `agentflow-api` to the exact frontend URL.

## 4. Configure optional integrations

Add the AI and OAuth variables in the Render service environment settings. OAuth redirect URLs must use the deployed API hostname:

```text
https://agentflow-api.onrender.com/api/integrations/oauth/gmail/callback
https://agentflow-api.onrender.com/api/integrations/oauth/slack/callback
https://agentflow-api.onrender.com/api/integrations/oauth/discord/callback
https://agentflow-api.onrender.com/api/integrations/oauth/google-sheets/callback
```

Register those exact URLs with each provider. The deterministic workflow builder still works when the AI keys are empty.

## 5. Verify the deployment

Open the API health endpoint:

```text
https://agentflow-api.onrender.com/api/health
```

Then open the frontend URL, register an account, and test login, workflow generation, execution, and the live execution timeline.

## Local verification before pushing

```bash
npm --prefix server install
npm --prefix client install
npm --prefix client run build
```
