from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob

app = Flask(__name__)
CORS(app)

@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text']
        blob = TextBlob(text)
        
        # Polarity: -1.0 (negative) to 1.0 (positive)
        polarity = blob.sentiment.polarity
        
        # Determine label
        if polarity > 0.1:
            label = 'positive'
        elif polarity < -0.1:
            label = 'negative'
        else:
            label = 'neutral'
            
        result = {
            'polarity': polarity,
            'label': label,
            'subjectivity': blob.sentiment.subjectivity
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run on port 5001 to avoid conflict with Node backend (5000)
    app.run(port=5001, debug=True)
