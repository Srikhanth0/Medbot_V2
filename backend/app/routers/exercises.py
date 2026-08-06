"""
Exercises Router — Metadata and semantic intent matching for 3D medical/mobility exercises.
"""

from __future__ import annotations

import re
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/api/exercises", tags=["Exercises"])

EXERCISE_CATALOG = {
    "jumping_jacks": {
        "animation_id": "jumping_jacks",
        "title": "Jumping Jacks",
        "target_area": "Full Body & Cardiovascular System",
        "description": "Dynamic full-body exercise that elevates heart rate, improves cardiovascular endurance, and warms up major muscle groups.",
        "difficulty": "Easy",
        "fbx_path": "/models/Jumping_Jacks.fbx",
        "contraindications": ["Severe knee osteoarthritis", "Acute ankle sprain", "Uncontrolled hypertension"],
        "instructions": [
            "Stand upright with feet together and arms at your sides.",
            "Jump up while spreading your legs shoulder-width apart and raising arms overhead.",
            "Jump back to the starting position landing softly on the balls of your feet.",
            "Maintain a steady, rhythmic cadence for 30–60 seconds."
        ],
        "keywords": {"jumping", "jacks", "cardio", "warmup", "warm", "up", "full", "body", "endurance", "heart", "stamina"}
    },
    "kettlebell_swing": {
        "animation_id": "kettlebell_swing",
        "title": "Kettlebell Swing",
        "target_area": "Posterior Chain & Core (Glutes, Hamstrings, Lower Back)",
        "description": "Explosive hip-hinge exercise strengthening the posterior chain, lower back, glutes, and core balance.",
        "difficulty": "Intermediate",
        "fbx_path": "/models/Kettlebell_Swing.fbx",
        "contraindications": ["Acute lumbar disc herniation", "Severe lower back strain", "Shoulder impingement"],
        "instructions": [
            "Stand with feet shoulder-width apart, hinging at hips while keeping chest up.",
            "Grasp the weight with both hands, driving hips forward explosively.",
            "Allow the weight to swing to chest height using momentum from the glutes.",
            "Guide the weight back down into the hip hinge without rounding the spine."
        ],
        "keywords": {"kettlebell", "swing", "posterior", "chain", "glutes", "hamstrings", "hip", "hinge", "lower", "back", "power", "deadlift"}
    },
    "pike_walk": {
        "animation_id": "pike_walk",
        "title": "Pike Walk / Inchworm",
        "target_area": "Core, Shoulders & Hamstrings",
        "description": "Dynamic mobility movement improving shoulder stability, hamstrings flexibility, and abdominal core engagement.",
        "difficulty": "Intermediate",
        "fbx_path": "/models/Pike_Walk.fbx",
        "contraindications": ["Wrist tendonitis", "Acute shoulder instability", "Glaucoma (head below waist)"],
        "instructions": [
            "Begin standing, hinge at the waist and place hands on the floor.",
            "Walk hands forward into a high plank position while holding core tight.",
            "Walk feet forward toward hands while keeping legs as straight as comfortable.",
            "Repeat for 5-8 continuous repetitions."
        ],
        "keywords": {"pike", "walk", "inchworm", "stretch", "flexibility", "hamstrings", "shoulders", "wrist", "mobility", "plank", "core"}
    },
    "pistol": {
        "animation_id": "pistol",
        "title": "Pistol Squat",
        "target_area": "Quadriceps, Glutes & Balance",
        "description": "Advanced single-leg squat demanding quad strength, knee stability, ankle mobility, and core balance.",
        "difficulty": "Advanced",
        "fbx_path": "/models/Pistol.fbx",
        "contraindications": ["Acute meniscus tear", "Patellar tendonitis", "Severe balance impairment"],
        "instructions": [
            "Stand on one leg with the opposing leg extended forward off the ground.",
            "Descend slowly into a deep squat on the standing leg keeping heel flat.",
            "Drive through the mid-foot to stand back up to starting position.",
            "Perform 3-5 controlled reps per side."
        ],
        "keywords": {"pistol", "squat", "leg", "legs", "quads", "quadriceps", "single", "balance", "knee", "thigh", "strength"}
    },
    "situps": {
        "animation_id": "situps",
        "title": "Sit-Ups",
        "target_area": "Abdominals & Hip Flexors",
        "description": "Classic abdominal strengthening exercise focused on building core endurance and anterior pelvic stability.",
        "difficulty": "Easy",
        "fbx_path": "/models/Situps.fbx",
        "contraindications": ["Acute cervical neck strain", "Osteoporosis with spinal fracture risk"],
        "instructions": [
            "Lie flat on back with knees bent at 90 degrees and feet flat.",
            "Cross arms over chest or place fingertips gently behind ears.",
            "Engage abdominals to lift torso up towards knees.",
            "Lower back down under control without placing tension on the neck."
        ],
        "keywords": {"situp", "situps", "sit", "up", "abs", "abdominal", "abdominals", "stomach", "belly", "core", "crunch", "crunches"}
    }
}


def match_best_exercise(query: str) -> dict | None:
    """
    Find the best matching exercise from the catalog based on keyword score & semantic intent.
    Returns the exercise metadata dict or None if no clear match.
    """
    clean_query = re.sub(r"[^\w\s]", "", query.lower())
    words = set(clean_query.split())

    best_match = None
    highest_score = 0

    for anim_id, data in EXERCISE_CATALOG.items():
        score = len(words.intersection(data["keywords"]))
        
        # Give extra weight if explicit title or ID is mentioned
        if anim_id.replace("_", " ") in clean_query or data["title"].lower() in clean_query:
            score += 5
        
        if score > highest_score:
            highest_score = score
            best_match = data

    if not best_match and any(w in words for w in {"exercise", "workout", "fitness", "train", "movement", "stretch"}):
        best_match = EXERCISE_CATALOG["jumping_jacks"]

    if best_match:
        return {k: v for k, v in best_match.items() if k != "keywords"}

    return None


@router.get("")
async def list_exercises():
    """
    List all available 3D exercise models and metadata.
    """
    return [{k: v for k, v in item.items() if k != "keywords"} for item in EXERCISE_CATALOG.values()]


@router.get("/recommend")
async def recommend_exercise(query: str = Query(..., description="User search or prompt query")):
    """
    Recommend the optimal 3D exercise model based on user query intent.
    """
    match = match_best_exercise(query)
    if not match:
        raise HTTPException(status_code=404, detail="No matching exercise found for query")
    return match


@router.get("/{animation_id}")
async def get_exercise_metadata(animation_id: str):
    """
    Fetch metadata for a specific exercise animation by ID.
    """
    exercise = EXERCISE_CATALOG.get(animation_id)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return exercise
