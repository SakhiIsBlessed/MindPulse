import sys
try:
    import flask
    import flask_cors
    import textblob
    print("SUCCESS: All modules imported.")
    print(f"Flask version: {flask.__version__}")
except ImportError as e:
    print(f"ERROR: {e}")
    sys.exit(1)
