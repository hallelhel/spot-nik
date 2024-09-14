# Vite React Monday.com Integration

This project integrates a Vite React app with the Monday.com API to manage tasks on a board. Follow the instructions below to set up and run the project.

## Getting Started

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone <repository-url>
cd <repository-directory>

```
### 2. Set Up Environment Variables
Create a .env file in the root of the project directory and add your environment variables. The .env file should look like this:

```bash
VITE_API_KEY=your_monday_api_key_here
VITE_BOARD_ID=your_board_id_here
```
Important:

VITE_API_KEY: This is your Monday.com API key. You can get it from the Monday.com Developers page by creating an API key.
VITE_BOARD_ID: This is the ID of the board you want to interact with. You can find it in the URL of your board, e.g., https://monday.com/boards/1625219934.
### 3. Configure the Task Board
Ensure your Monday.com board has the following columns:

Text: A text column for task descriptions.
Date: A date column for task deadlines.
Status: A status column to track task progress.
To set up these columns:

Open your board in Monday.com.
Add a column for Text (if it’s not already present).
Add a column for Date.
Add a column for Status and configure the status labels as needed.
### 4. Run the Development Server
Start the development server with the following command:

```bash
npm run dev
The app will be accessible at http://localhost:4000 (or the port specified by Vite).
```
### 5. Build and Deploy
To build the project for production, use:

```bash

npm run build
```
This will generate optimized files in the dist directory, which you can then deploy to your server.

Using the .env File in Your Project
Ensure you have the dotenv package installed if you’re working outside of Vite or other frameworks that handle environment variables differently. You can install it using:

```bash

npm install dotenv
```
Make sure you use the VITE_ prefix for environment variables that need to be exposed to your Vite project. For example, in your mondayApi file, you should use:

js
Copy code
const API_KEY = import.meta.env.VITE_API_KEY;
const BOARD_ID = import.meta.env.VITE_BOARD_ID;
This will correctly load your environment variables and make them accessible in your application code.
