from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob
import random
import time
import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv(dotenv_path='../backend/.env')

app = Flask(__name__)
CORS(app)

# Initialize OpenAI
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Wellness Resources & Responses (Fallback/Specifics)
WELLNESS_SUGGESTIONS = {
    'stressed': ['Breathing Exercise', 'Calming Music', 'Yoga'],
    'anxious': ['Grounding Technique', 'Journaling', 'Nature Sounds'],
    'sad': ['Positive Affirmation', 'Gratitude Journal', 'Comforting Music'],
    'happy': ['Share your win', 'Keep the streak'],
    'neutral': ['Daily Check-in', 'Mindfulness']
}

RISK_KEYWORDS = ['suicide', 'kill myself', 'end my life', 'hurt myself', 'die', 'death', 'jump off']

GENERAL_RESPONSES = {
    'hello': "Hi there! 👋 How are you feeling today?",
    'hi': "Hey! Great to see you. What's on your mind?",
    'how are you': "I'm here and ready to listen. How can I support you today? 💜",
    'help': "I'm here to listen and support you. Tell me what's troubling you or how you're feeling.",
    'thanks': "You're welcome! Remember, taking care of yourself is important. 🌟",
    'bye': "Take care of yourself! Remember, you've got this. 💪"
}

def detect_emotion_fallback(text):
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    if polarity > 0.3: return 'happy'
    elif polarity < -0.1: return 'sad'
    return 'neutral'

@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text']
        blob = TextBlob(text)
        
        return jsonify({
            'polarity': blob.sentiment.polarity,
            'subjectivity': blob.sentiment.subjectivity
        }) 
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400

        user_lower = user_message.lower()

        # 1. IMMEDIATE RISK DETECTION (Safety First)
        if any(keyword in user_lower for keyword in RISK_KEYWORDS):
            return jsonify({
                'text': "I'm detecting that you might be in distress. Please know you are not alone. It's really important to talk to someone who can help you right now.",
                'emotion': 'distress',
                'risk': True,
                'suggestions': ['Call 988 (Crisis Lifeline)', 'Reach out to a trusted friend', 'Go to the nearest emergency room']
            })

        # 2. SPECIFIC WELLNESS TRIGGERS (Hardcoded for reliability)
        if 'breathing' in user_lower:
            return jsonify({
                'text': "Let's do this together. Inhale deeply for 4 seconds... hold for 7... and exhale slowly for 8. 🌿 Repeating this can help you feel grounded.",
                'emotion': 'neutral',
                'risk': False,
                'suggestions': ['Do it again', 'Try calm music']
            })
        
        if 'journaling' in user_lower:
            return jsonify({
                'text': "Great choice! Here is a prompt: 'Write about one thing that made you smile today, no matter how small.' 📝",
                'emotion': 'happy',
                'risk': False,
                'suggestions': ['Another prompt', 'I did it!']
            })

        # 3. OPENAI GPT RESPONSE
        try:
            # System prompt to define persona and output format
            system_prompt = """
            You are MindPulse, a caring, empathetic, and friendly mental wellness companion for students.
            Your goal is to provide emotional support, listen without judgment, and offer gentle wellness advice.
            
            IMPORTANT:
            - Keep responses SHORT (under 2 sentences) and conversational.
            - Use comforting emojis (🌿, 💜, 🌟, 🧘‍♀️).
            - Detect the user's emotion (happy, sad, stressed, anxious, neutral).
            - Suggest 1-2 relevant short actions (e.g., "Take a breath", "Listen to music").
            
            OUTPUT FORMAT:
            You must return the response in this exact format (no markdown):
            Perspective: [Emotion]
            Response: [Your message here]
            """

            completion = client.chat.completions.create(
                model="gpt-4o-mini", 
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=150,
                temperature=0.7
            )

            gpt_content = completion.choices[0].message.content
            
            # Simple parsing of the custom format
            # Fallback values
            ai_text = gpt_content
            emotion = "neutral"
            
            lines = gpt_content.split('\n')
            for line in lines:
                if line.startswith("Perspective:"):
                    emotion = line.replace("Perspective:", "").strip().lower()
                elif line.startswith("Response:"):
                    ai_text = line.replace("Response:", "").strip()

            # Clean up emotion just in case
            valid_emotions = ['happy', 'sad', 'stressed', 'anxious', 'neutral']
            if emotion not in valid_emotions:
                emotion = 'neutral'
                
            return jsonify({
                'text': ai_text,
                'emotion': emotion,
                'risk': False,
                'suggestions': WELLNESS_SUGGESTIONS.get(emotion, ['Breathing', 'Journaling'])
            })

        except Exception as e:
            print(f"OpenAI Error: {e}")
            # Fallback Intelligence (Simulated AI) when API fails/quota exceeded
            
            # 1. check general responses (Greetings, etc.)
            tokens = set(user_lower.split())
            for pattern, response in GENERAL_RESPONSES.items():
                if (len(pattern.split()) == 1 and pattern in tokens) or (len(pattern.split()) > 1 and pattern in user_lower):
                    return jsonify({
                        'text': response,
                        'emotion': 'neutral',
                        'risk': False,
                        'suggestions': ['Check my mood', 'Journaling']
                    })

            # 2. Emotion-based response
            emotion = detect_emotion_fallback(user_message)
            response_text = random.choice(WELLNESS_SUGGESTIONS.get(emotion, WELLNESS_SUGGESTIONS['neutral']))
            
            return jsonify({
                'text': response_text,
                'emotion': emotion,
                'risk': False,
                'suggestions': ['Breathing Exercise', 'Journaling']
            })

    except Exception as e:
        print(f"Server Error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Run on port 5001 to avoid conflict with Node backend/frontend default ports
    app.run(port=5001, debug=True)
