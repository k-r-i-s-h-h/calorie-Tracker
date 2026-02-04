import os
import time
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
# Service Role Key (from chat history)
service_key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzeHB1YnJmc3ZzemRqcGJ3Zm1oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDEzMjUxNSwiZXhwIjoyMDg1NzA4NTE1fQ.7V10THCu1zDF2JfzOtKsp9uKD4NuCCB_tgo3UGYo3tY"

supabase: Client = create_client(url, service_key)

def create_demo_user():
    # Use timestamp to ensure uniqueness
    email = f"test_admin_{int(time.time())}@gmail.com"
    password = "password123"
    
    print(f"Attempting to create user {email} via Admin API...")
    try:
        # Use Admin API to create user directly
        # Note: In some python versions it's supabase.auth.admin.create_user
        res = supabase.auth.admin.create_user({
            "email": email, 
            "password": password,
            "email_confirm": True
        })
        
        user = res.user
        if user:
            print(f"\nSUCCESS! Admin User Created.")
            print(f"EMAIL: {email}")
            print(f"USER_ID: {user.id}")
            return user.id
        else:
            print("Response received but no user object?", res)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_demo_user()
