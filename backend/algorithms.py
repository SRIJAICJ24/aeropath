import math
import itertools
import random
import heapq
from typing import List, Tuple, Dict, Optional, Any

class Point:
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y

    def to_dict(self):
        return {"x": self.x, "y": self.y}

def get_dist(p1: Point, p2: Point) -> float:
    return math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2)

def intersect(p1: Point, p2: Point, obs: Dict) -> bool:
    # Rectangle edges
    left = obs['x']
    right = obs['x'] + obs['width']
    top = obs['y']
    bottom = obs['y'] + obs['height']

    # Point-in-rectangle check
    def is_inside(p: Point):
        return left <= p.x <= right and top <= p.y <= bottom

    if is_inside(p1) or is_inside(p2):
        return True

    def line_intersects_line(a, b, c, d):
        def det(v1, v2):
            return v1[0] * v2[1] - v1[1] * v2[0]
        
        def sub(v1, v2):
            return (v1[0] - v2[0], v1[1] - v2[1])

        v1 = (b.x - a.x, b.y - a.y)
        v2 = (d.x - c.x, d.y - c.y)
        
        denom = det(v1, v2)
        if denom == 0: return False
        
        t = det(sub(c, a), v2) / denom
        u = det(sub(c, a), v1) / denom
        
        return 0 <= t <= 1 and 0 <= u <= 1

    rect_edges = [
        (Point(left, top), Point(right, top)),
        (Point(right, top), Point(right, bottom)),
        (Point(right, bottom), Point(left, bottom)),
        (Point(left, bottom), Point(left, top))
    ]

    for edge_p1, edge_p2 in rect_edges:
        if line_intersects_line(p1, p2, edge_p1, edge_p2):
            return True
            
    return False

def is_valid_segment(p1: Point, p2: Point, obstacles: List[Dict]) -> bool:
    for obs in obstacles:
        if intersect(p1, p2, obs):
            return False
    return True

def nearest_neighbor_tsp(points: List[Point], obstacles: List[Dict]) -> Tuple[List[int], float, List[str], List[List[int]]]:
    if not points: return [], 0, ["[LOGIC] No points provided."], []
    logs = []
    frontier_history = []
    
    n = len(points)
    unvisited = set(range(1, n))
    curr = 0
    path = [0]
    total_dist = 0
    
    logs.append(f"[LOGIC] Initializing Greedy (Nearest Neighbor) State Space. Total Nodes: {n}")
    
    while unvisited:
        logs.append(f"[SEARCH] Evaluating neighbors for Node {curr}...")
        frontier_history.append(list(unvisited))
        
        next_node = -1
        min_d = float('inf')
        
        for node in unvisited:
            d = get_dist(points[curr], points[node])
            if not is_valid_segment(points[curr], points[node], obstacles):
                logs.append(f"[CSP] Constraint Violation! Path {curr}->{node} blocked by No-Fly Zone.")
                d = float('inf') # Hard constraint
            
            if d < min_d:
                min_d = d
                next_node = node
        
        if next_node == -1:
            logs.append(f"[WARNING] No valid unblocked path from Node {curr}. Dead end.")
            # For the sake of demonstration, we'll force pick the first unvisited 
            # and take the penalty (or it could terminate). Let's pick and add big penalty.
            next_node = list(unvisited)[0]
            total_dist += get_dist(points[curr], points[next_node]) * 1000 # huge penalty
            logs.append(f"[CSP] Forcing path {curr}->{next_node} despite violation.")
        else:
            total_dist += min_d
            logs.append(f"[SEARCH] Node {next_node} selected. Cost: {min_d:.2f}")
            
        path.append(next_node)
        unvisited.remove(next_node)
        curr = next_node
    
    # Return to hub
    logs.append(f"[LOGIC] Returning to Hub (Node 0)...")
    if not is_valid_segment(points[curr], points[0], obstacles):
        logs.append(f"[CSP] Constraint Violation! Return path {curr}->0 blocked.")
        total_dist += get_dist(points[curr], points[0]) * 1000
    else:
        total_dist += get_dist(points[curr], points[0])
        logs.append(f"[CSP] Return path clear.")
        
    return path, total_dist, logs, frontier_history

def a_star_tsp(points: List[Point], obstacles: List[Dict]) -> Tuple[List[int], float, List[str], List[List[int]]]:
    n = len(points)
    logs = [f"[LOGIC] Initializing A* State Space. N={n}, Max Complexity O(N!)."]
    frontier_history = []
    
    if n <= 1:
        return list(range(n)), 0, logs, []
        
    # State: (g_cost + h_cost, g_cost, current_node, visited_bitmask, path_history)
    start_state = (0.0, 0.0, 0, 1, [0]) # 1 is bitmask for node 0 visited (1 << 0)
    
    pq = []
    heapq.heappush(pq, start_state)
    
    # Track best g_cost for each state
    best_g = {}
    best_g[(0, 1)] = 0.0
    
    goal_mask = (1 << n) - 1
    
    max_iters = 50000
    iters = 0
    
    while pq and iters < max_iters:
        iters += 1
        est_total, g_cost, curr, mask, path = heapq.heappop(pq)
        
        # We sample frontier for visualization to avoid overwhelming frontend
        if iters % max(1, n // 2) == 0:
            unvisited = [i for i in range(n) if not (mask & (1 << i))]
            if unvisited:
                frontier_history.append(unvisited)
                # Keep logs manageable
                if len(logs) < 100:
                   logs.append(f"[SEARCH] Frontier popped Node {curr}. Evaluating {len(unvisited)} neighbors...")

        if mask == goal_mask:
            # Need to return to start
            if not is_valid_segment(points[curr], points[0], obstacles):
                logs.append(f"[CSP] Constraint Violation at end node {curr}->0 blocked.")
                continue # Path is invalid
                
            final_cost = g_cost + get_dist(points[curr], points[0])
            logs.append(f"[LOGIC] A* Goal Reached! Optimal Cost: {final_cost:.2f}")
            return path, final_cost, logs, frontier_history
            
        unvisited = [i for i in range(n) if not (mask & (1 << i))]
        for next_node in unvisited:
            if not is_valid_segment(points[curr], points[next_node], obstacles):
                if len(logs) < 100:
                    logs.append(f"[CSP] Constraint Violation! {curr}->{next_node} blocked.")
                continue
                
            edge_cost = get_dist(points[curr], points[next_node])
            new_g = g_cost + edge_cost
            new_mask = mask | (1 << next_node)
            
            # Simple heuristic: distance to hub from next_node. Since it relaxed, it's admissible
            h_cost = get_dist(points[next_node], points[0]) 
            
            if len(logs) < 100 and random.random() < 0.2:
                 logs.append(f"[SEARCH] Heuristic h({next_node}) calculated: {h_cost:.2f}")
                 
            f_cost = new_g + h_cost
            
            state_key = (next_node, new_mask)
            if state_key not in best_g or new_g < best_g[state_key]:
                best_g[state_key] = new_g
                heapq.heappush(pq, (f_cost, new_g, next_node, new_mask, path + [next_node]))

    logs.append("[WARNING] A* Search exhausted or exceeded max iterations.")
    # Fallback to greedy if failed
    return path if 'path' in locals() else [], -1, logs, frontier_history

def simulated_annealing_tsp(points: List[Point], obstacles: List[Dict]) -> Tuple[List[int], float, List[str], List[List[int]]]:
    n = len(points)
    logs = [f"[LOGIC] Initializing Simulated Annealing..."]
    frontier_history = []
    if n <= 1: return list(range(n)), 0, logs, []
    
    def calculate_dist(path):
        d = 0
        valid = True
        for i in range(len(path) - 1):
            if not is_valid_segment(points[path[i]], points[path[i+1]], obstacles):
                valid = False
                d += 1000000
            d += get_dist(points[path[i]], points[path[i+1]])
        if not is_valid_segment(points[path[-1]], points[path[0]], obstacles):
            valid = False
            d += 1000000
        d += get_dist(points[path[-1]], points[path[0]])
        return d, valid

    curr_path = list(range(n))
    random.shuffle(curr_path)
    idx0 = curr_path.index(0)
    curr_path[0], curr_path[idx0] = curr_path[idx0], curr_path[0]
    
    curr_dist, _ = calculate_dist(curr_path)
    temp = 1000
    cooling_rate = 0.995
    
    best_path = curr_path[:]
    best_dist = curr_dist
    
    for i in range(5000):
        new_path = curr_path[:]
        if n > 3:
            u, v = sorted(random.sample(range(1, n), 2))
            new_path[u:v+1] = reversed(new_path[u:v+1])
        
        if i % 500 == 0:
            frontier_history.append(new_path[1:4])
            logs.append(f"[SEARCH] Temp: {temp:.2f}, Best Cost: {best_dist:.2f}")
            
        new_dist, is_valid = calculate_dist(new_path)
        if not is_valid and random.random() < 0.05:
            # logs.append("[CSP] Evaluated invalid state, applying penalty.")
            pass
            
        if new_dist < curr_dist or random.random() < math.exp((curr_dist - new_dist) / temp):
            curr_path = new_path
            curr_dist = new_dist
            if curr_dist < best_dist:
                best_dist = curr_dist
                best_path = curr_path[:]
        
        temp *= cooling_rate
        if temp < 0.01: break
        
    logs.append(f"[LOGIC] Final Optimized Cost: {best_dist:.2f}")
    return best_path, best_dist, logs, frontier_history
