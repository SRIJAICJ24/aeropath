from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import time
from algorithms import Point, nearest_neighbor_tsp, a_star_tsp, simulated_annealing_tsp

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Obstacle(BaseModel):
    x: float
    y: float
    width: float
    height: float

class SolveRequest(BaseModel):
    points: List[Dict[str, float]]
    obstacles: List[Dict[str, float]]

@app.post("/solve")
async def solve(request: SolveRequest):
    pts = [Point(p['x'], p['y']) for p in request.points]
    obs = request.obstacles

    if not pts:
        return {"error": "No points provided"}

    # Algorithm A: Sub-optimal (Greedy)
    start_time_a = time.time()
    path_a, dist_a, logs_a, frontier_a = nearest_neighbor_tsp(pts, obs)
    time_a = time.time() - start_time_a

    # Algorithm B: Optimal (Informed)
    start_time_b = time.time()
    if len(pts) < 10:
        path_b, dist_b, logs_b, frontier_b = a_star_tsp(pts, obs)
    else:
        path_b, dist_b, logs_b, frontier_b = simulated_annealing_tsp(pts, obs)
    time_b = time.time() - start_time_b

    # Combine logs and add metadata
    combined_logs = logs_a + ["[LOGIC] Switching to Algorithm B..."] + logs_b
    combined_frontier = frontier_a + frontier_b

    return {
        "algorithm_a": {
            "path": path_a,
            "distance": round(dist_a, 2),
            "time": round(time_a * 1000, 2) # in ms
        },
        "algorithm_b": {
            "path": path_b,
            "distance": round(dist_b, 2),
            "time": round(time_b * 1000, 2) # in ms
        },
        "logs": combined_logs,
        "frontier_history": combined_frontier
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
