import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables (same file used by the Flask app)
# Make sure OPENAI_API_KEY is defined in backend/.env or in your environment
load_dotenv(dotenv_path='../backend/.env')

key = os.getenv('OPENAI_API_KEY')
print(f"Key loaded: {str(key)[:10]}...{str(key)[-5:] if key else 'None'}")

if not key:
    print("ERROR: API Key not found in environment variables.")
    exit(1)

try:
    client = OpenAI(api_key=key)
    print("Client initialized. Sending test request...")
    
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": "Hello, are you working?"}
        ]
    )
    print("Success! Response:")
    print(completion.choices[0].message.content)
except Exception as e:
    print(f"FAILED: {e}")
