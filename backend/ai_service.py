import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
import base64

# Load environment variables
load_dotenv()

# Configure Google Gemini
api_key = os.environ.get("GOOGLE_API_KEY")
if not api_key:
    print("ERROR: GOOGLE_API_KEY not found in environment variables.")
    print("Get your key from: https://aistudio.google.com/apikey")
else:
    genai.configure(api_key=api_key)
    print("✅ Google Gemini API configured")

async def estimate_nutrition(query: str):
    """
    Uses Google Gemini to estimate nutrition facts for a given food query.
    Returns: JSON with food_name, calories, protein, carbs, fats.
    """
    print(f"Analyzing food query with Gemini: {query}")
    
    prompt = f"""You are a nutritionist API. Return ONLY valid JSON, no other text.
Estimate the nutrition for: "{query}".

Return this exact format:
{{
    "food_name": "Display Name",
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fats": 0,
    "serving_size": "e.g. 1 medium apple"
}}

If specific quantity isn't given, assume a standard serving.
"""

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        # Extract JSON from response
        content = response.text.strip()
        
        # Remove markdown code blocks if present
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "").strip()
        elif content.startswith("```"):
            content = content.replace("```", "").strip()
        
        data = json.loads(content)
        print(f"✅ Gemini Success: {data}")
        return data
        
    except Exception as e:
        print(f"❌ Gemini Error: {e}")
        print(f"Error type: {type(e).__name__}")
        
        # Fallback Mock Data
        print("Falling back to Mock Data...")
        mock_data = {
            "food_name": query,
            "calories": 250, 
            "protein": 12,
            "carbs": 30,
            "fats": 8,
            "serving_size": "1 estimated serving (Mock)"
        }
        
        # Simple heuristics
        if "egg" in query.lower():
            mock_data = {"food_name": query, "calories": 140, "protein": 12, "carbs": 1, "fats": 10, "serving_size": "2 large eggs (Mock)"}
        elif "chicken" in query.lower():
             mock_data = {"food_name": query, "calories": 300, "protein": 35, "carbs": 0, "fats": 15, "serving_size": "1 breast (Mock)"}
        elif "apple" in query.lower():
             mock_data = {"food_name": query, "calories": 95, "protein": 0.5, "carbs": 25, "fats": 0.3, "serving_size": "1 medium (Mock)"}
             
        return mock_data


async def analyze_food_image(base64_image: str):
    """
    Uses Google Gemini Vision to identify food and estimate nutrition from a base64 image.
    """
    print("🔍 Analyzing food image with Gemini Vision...")
    
    prompt = """You are a nutritionist. Identify the food in this image.
Focus on basic whole foods (fruits, vegetables, eggs, meat, fish) or common dishes.
Return ONLY valid JSON with this exact format:
{
    "food_name": "Display Name",
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fats": 0,
    "serving_size": "e.g. 1 medium apple"
}
If unsure, make a best guess based on appearance.
"""

    try:
        # Use gemini-2.5-flash which supports both text and vision
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Decode base64 to bytes for proper image handling
        import io
        from PIL import Image as PILImage
        
        # Strip data URI prefix if present (e.g., "data:image/jpeg;base64,...")
        if base64_image.startswith('data:'):
            base64_image = base64_image.split(',', 1)[1]
        
        # Fix base64 padding if needed
        missing_padding = len(base64_image) % 4
        if missing_padding:
            base64_image += '=' * (4 - missing_padding)
        
        print(f"Base64 length after cleanup: {len(base64_image)}")
        
        image_bytes = base64.b64decode(base64_image)
        print(f"Decoded bytes length: {len(image_bytes)}")
        print(f"First 20 bytes: {image_bytes[:20]}")
        
        image = PILImage.open(io.BytesIO(image_bytes))
        print(f"Image opened: {image.format} {image.size}")
        
        # Generate content with image
        response = model.generate_content([prompt, image])
        
        content = response.text.strip()
        
        # Remove markdown code blocks if present
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "").strip()
        elif content.startswith("```"):
            content = content.replace("```", "").strip()
        
        data = json.loads(content)
        print(f"✅ Gemini Vision Success: {data}")
        return data
        
    except Exception as e:
        print(f"❌ Gemini Vision Error: {e}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        
        # Fallback if vision fails
        return {
            "food_name": "Vision unavailable - Demo",
            "calories": 250, 
            "protein": 15, 
            "carbs": 30, 
            "fats": 10,
            "serving_size": "1 serving (using demo data)"
        }
