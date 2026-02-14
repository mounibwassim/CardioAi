import requests

BACKEND_URL = "https://cardioai-backend.onrender.com"

def check_health():
    try:
        print(f"Checking {BACKEND_URL}/health...")
        resp = requests.get(f"{BACKEND_URL}/health", timeout=10)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")
    except Exception as e:
        print(f"Health check failed: {e}")

def check_cors_preflight():
    try:
        print(f"\nChecking CORS OPTIONS on {BACKEND_URL}/predict...")
        headers = {
            "Origin": "https://cardio-ai-delta.vercel.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,authorization"
        }
        resp = requests.options(f"{BACKEND_URL}/predict", headers=headers, timeout=10)
        print(f"Status: {resp.status_code}")
        print("Headers:")
        for k, v in resp.headers.items():
            if "access-control" in k.lower():
                print(f"  {k}: {v}")
    except Exception as e:
        print(f"CORS check failed: {e}")

if __name__ == "__main__":
    check_health()
    check_cors_preflight()
