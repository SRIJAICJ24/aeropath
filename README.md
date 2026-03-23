# AeroPath Tactical Command

AeroPath is an autonomous drone logistics and search optimizer application designed with a high-fidelity "Tactical Command" aesthetic. It visualizes the process of solving the Traveling Salesman Problem (TSP) using AI search algorithms (A* vs. Greedy) and Constraint Satisfaction Problem (CSP) mechanics (dynamic no-fly zones).

## Features

*   **Tactical Dashboard UI**: A dark-mode, glassmorphism-heavy interface inspired by military and sci-fi command centers.
*   **Real-Time Path Visualization**: See the drone calculate and traverse the optimal path on a topographical grid map.
*   **Algorithm Comparison**: Visually compares a standard Greedy approach against a globally optimized Simulated Annealing/A* heuristic implementation.
*   **Dynamic Obstacles (No-Fly Zones)**: Users can draw red rectangular zones that act as hard constraints, forcing the AI to re-route dynamically.
*   **State Space Complexity Visualization**: An interactive graph demonstrating the $O(N!)$ combinatorial explosion of routing permutations.
*   **X-Ray Logic Stream**: A terminal-style logic readout providing deep insight into the AI's internal state evaluation and decision-making process.

## Tech Stack

*   **Frontend**: React, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons.
*   **Backend**: Python, FastAPI, Uvicorn (Handles heavy path optimization and algorithm simulations).

## Running the Application Locally

### Requirements
*   Node.js (v18+)
*   Python (3.8+)

### 1. Start the Backend API
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate # On Windows
pip install fastapi uvicorn pydantic
python main.py
```
The FastAPI server will start on `http://localhost:8000`.

### 2. Start the Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
The Vite development server will start on `http://localhost:5173`. Open this URL in the browser to access the tactical dashboard.

## Methodology

*   **Problem Formulation**: TSP defined with an initial state (0,0 hub), goal state (all nodes visited, return to hub), and state space comprising all point permutations.
*   **Informed Search**: Utilizing Euclidean distance as an $h(n)$ heuristic to guide an optimized simulated annealing process.
*   **Constraint Satisfaction**: Obstacles are processed as binary geometric constraints validating flight paths mathematically.
