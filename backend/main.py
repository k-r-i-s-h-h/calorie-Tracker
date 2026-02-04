from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
from database import get_db
from ai_service import estimate_nutrition, analyze_food_image
from typing import Optional, List
import datetime

load_dotenv()

app = FastAPI(title="AI Calorie Tracker API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchQuery(BaseModel):
    query: str

class LogEntry(BaseModel):
    user_id: str # Temporary until Auth middleware
    date: str # YYYY-MM-DD
    meal_type: str = "Snack"
    food_name: str
    calories: int
    protein: float = 0
    carbs: float = 0
    fats: float = 0

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Backend is running!"}

@app.get("/api/search")
async def search_food(q: str):
    if not q:
        raise HTTPException(status_code=400, detail="Query required")
    data = await estimate_nutrition(q)
    return data

class ImageAnalysisRequest(BaseModel):
    image: str  # base64 encoded image

@app.post("/api/analyze-image")
async def analyze_image(request: ImageAnalysisRequest):
    """Analyze food image using AI vision"""
    print("=" * 50)
    print("🔍 ANALYZE IMAGE REQUEST RECEIVED")
    print(f"Image data length: {len(request.image) if request.image else 0} characters")
    print("=" * 50)
    
    if not request.image:
        raise HTTPException(status_code=400, detail="Image data required")
    
    try:
        print("Calling AI service...")
        result = await analyze_food_image(request.image)
        print(f"✅ AI Success: {result}")
        return result
    except Exception as e:
        print(f"❌ Error analyzing image: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to analyze image: {str(e)}")


@app.get("/api/streak")
def get_streak(user_id: str):
    """Calculate current logging streak for a user"""
    from datetime import datetime, timedelta
    
    supabase = get_db()
    
    # Get all log dates for this user, ordered by date descending
    res = supabase.table("food_logs")\
        .select("date")\
        .eq("user_id", user_id)\
        .order("date", desc=True)\
        .execute()
    
    if not res.data:
        return {"streak": 0}
    
    # Convert to dates and sort
    log_dates = [datetime.strptime(log["date"], "%Y-%m-%d").date() for log in res.data]
    log_dates.sort(reverse=True)  # Most recent first
    
    today = datetime.now().date()
    streak = 0
    
    # If they logged today, start counting
    if log_dates[0] == today:
        streak = 1
        expected_date = today - timedelta(days=1)
        
        # Count consecutive days backwards
        for log_date in log_dates[1:]:
            if log_date == expected_date:
                streak += 1
                expected_date -= timedelta(days=1)
            else:
                break
    # If they logged yesterday, count from yesterday
    elif log_dates[0] == today - timedelta(days=1):
        streak = 1
        expected_date = log_dates[0] - timedelta(days=1)
        
        for log_date in log_dates[1:]:
            if log_date == expected_date:
                streak += 1
                expected_date -= timedelta(days=1)
            else:
                break
    # Otherwise, streak is broken (reset to 0)
    
    return {"streak": streak}


@app.post("/api/log")
def log_food(entry: LogEntry):
    print(f"DEBUG: Logging food for user {entry.user_id} on {entry.date}: {entry.food_name}")
    supabase = get_db()
    
    # 1. Get or Create Daily Log
    # Try to find existing log
    res = supabase.table("food_logs").select("id, total_calories").eq("user_id", entry.user_id).eq("date", entry.date).execute()
    
    log_id = None
    current_cals = 0
    
    if res.data:
        log_id = res.data[0]['id']
        current_cals = res.data[0]['total_calories']
        print(f"DEBUG: Found existing log {log_id}, current cals: {current_cals}")
    else:
        # Create new log
        print("DEBUG: Creating new daily log")
        new_log = supabase.table("food_logs").insert({
            "user_id": entry.user_id, 
            "date": entry.date,
            "total_calories": 0
        }).execute()
        log_id = new_log.data[0]['id']
    
    # 2. Insert Meal Entry
    print(f"DEBUG: Inserting meal entry linked to log {log_id}")
    meal_res = supabase.table("meal_entries").insert({
        "log_id": log_id,
        "meal_type": entry.meal_type,
        "food_name": entry.food_name,
        "calories": entry.calories,
        "protein": entry.protein,
        "carbs": entry.carbs,
        "fats": entry.fats
    }).execute()
    
    meal_id = meal_res.data[0]['id']
    
    # 3. Update Daily Totals
    # Note: Trigger could do this, but doing it manually for simplicity
    new_total = current_cals + entry.calories
    print(f"DEBUG: Updating total calories to {new_total}")
    supabase.table("food_logs").update({"total_calories": new_total}).eq("id", log_id).execute()
    
    return {"status": "success", "new_total": new_total, "id": meal_id}

@app.delete("/api/log/{entry_id}")
def delete_log_entry(entry_id: str):
    print(f"DEBUG: Deleting entry {entry_id}")
    supabase = get_db()

    # 1. Get the entry to know calories and log_id
    res = supabase.table("meal_entries").select("*").eq("id", entry_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    entry = res.data[0]
    log_id = entry['log_id']
    
    # 2. Delete the entry
    supabase.table("meal_entries").delete().eq("id", entry_id).execute()
    
    # 3. Recalculate totals (Safer than subtraction)
    entries_res = supabase.table("meal_entries").select("calories").eq("log_id", log_id).execute()
    total_cals = sum(item['calories'] for item in entries_res.data) if entries_res.data else 0
    
    # 4. Update Log
    print(f"DEBUG: New total after delete: {total_cals}")
    supabase.table("food_logs").update({"total_calories": total_cals}).eq("id", log_id).execute()
    
    return {"status": "success", "new_total": total_cals}

@app.get("/api/day")
def get_day_view(user_id: str, date: str):
    print(f"DEBUG: Fetching day view for {user_id} on {date}")
    supabase = get_db()
    
    # Fetch log
    res = supabase.table("food_logs").select("*").eq("user_id", user_id).eq("date", date).execute()
    
    if not res.data:
        print("DEBUG: No log found for this date")
        return {
            "total_calories": 0,
            "meals": []
        }
        
    log = res.data[0]
    print(f"DEBUG: Found log {log['id']}, fetching meals...")
    
    # Fetch entries
    entries_res = supabase.table("meal_entries").select("*").eq("log_id", log['id']).order("created_at").execute()
    print(f"DEBUG: Found {len(entries_res.data)} meals")
    
    return {
        "total_calories": log['total_calories'],
        "meals": entries_res.data
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
