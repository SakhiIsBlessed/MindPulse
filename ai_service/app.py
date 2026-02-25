from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob
import random
import time
import os
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path='../backend/.env')

app = Flask(__name__)
CORS(app)

# OpenAI removed: always use internal fallback intelligence
client = None

# Wellness Resources & Responses (Fallback/Specifics)
WELLNESS_SUGGESTIONS = {
    'stressed': ['Breathing Exercise', 'Calming Music', 'Yoga'],
    'anxious': ['Grounding Technique', 'Journaling', 'Nature Sounds'],
    'sad': ['Positive Affirmation', 'Gratitude Journal', 'Comforting Music'],
    'happy': ['Share your win', 'Keep the streak'],
    'neutral': ['Daily Check-in', 'Mindfulness']
}

RISK_KEYWORDS = ['suicide', 'suicidal', 'kill', 'kill myself', 'end my life', 'hurt myself', 'die', 'death', 'jump off','I feel like hurting myself','I don’t want to live anymore.','I feel hopeless and lost.']

GENERAL_RESPONSES = {
    'hello': "Hi there! 👋 How are you feeling today?",
    'hi': "Hey! Great to see you. What's on your mind?",
    'how are you': "I'm fine ! How are you today? 💜",
    'help': "I'm here to listen and support you. Tell me what's troubling you or how you're feeling.",
    'thanks': "You're welcome! Remember, taking care of yourself is important. 🌟",
    'bye': "Take care of yourself! Remember, you've got this. 💪",
    'how was your day':"My day was productive and fulfilling. How was yours?",
    'i am fine': "That's great to hear! How can I support you today?"

}

# Expanded intent definitions: patterns, canned response, emotion, suggestions
INTENT_DEFINITIONS = [
    {
        'name': 'greeting',
        'patterns': ['hello', 'hi', 'hey',"Namaste","Namaskar"],
        'response': "Hi there! 👋 How are you feeling today?",
        'emotion': 'neutral',
        'suggestions': ['Daily Check-in', 'Journaling']
    },
    {
        'name': 'greeting',
        'patterns': ["good morning"],
        'response': "Good Morning ! How are you feeling today?",
        'emotion': 'neutral',
        'suggestions': ['Daily Check-in', 'Journaling']
    },
    {
        'name': 'greeting',
        'patterns': ["good evening"],
        'response': "Good evening ! How are you feeling today?",
        'emotion': 'neutral',
        'suggestions': ['Daily Check-in', 'Journaling']
    },
    {
        'name': 'thanks',
        'patterns': ['thanks', 'thank you', 'thx'],
        'response': "You're welcome! Remember, taking care of yourself is important. 🌟",
        'emotion': 'happy',
        'suggestions': ['Keep going', 'Share a win']
    },
    {
        'name': 'help',
        'patterns': ['help', 'support', 'assist'],
        'response': "I'm here to listen and support you. Tell me what's troubling you or how you're feeling.",
        'emotion': 'neutral',
        'suggestions': ['Describe how you feel', 'Try breathing exercise']
    },
    {
        'name': 'breathing',
        'patterns': ['breath', 'breathing', 'breathe'],
        'response': "Let's do this together. Inhale 4s, hold 7s, exhale 8s. 🌿",
        'emotion': 'neutral',
        'suggestions': ['Do it again', 'Calming music']
    },
    {
        'name': 'journaling',
        'patterns': ['journal', 'journaling', 'write'],
        'response': "Great choice! Here's a prompt: 'Write about one thing that made you smile today.' 📝",
        'emotion': 'happy',
        'suggestions': ['Another prompt', 'I did it!']
    },
    {
        'name': 'mindfulness',
        'patterns': ['mindful', 'mindfulness', 'meditate', 'meditation'],
        'response': "Try a short 2-minute mindfulness: notice breath, body, and sounds. 🌟",
        'emotion': 'neutral',
        'suggestions': ['Breathing Exercise', 'Guided meditation']
    },
    {
        'name': 'sleep_help',
        'patterns': ['sleep', 'insomnia', 'cant sleep', "can't sleep"],
        'response': "Try a wind-down: dim lights, avoid screens, and try 4-7-8 breathing. 🌙",
        'emotion': 'neutral',
        'suggestions': ['Wind-down routine', 'Calming music']
    },
    {
    'name': 'lonely_sad',
    'patterns': [
        'i feel very lonely',
        'nothing is going right',
        'i feel empty',
        'i feel tired of everything',
        'dont feel like talking',
        'feel like crying'
    ],
    'response': "I'm really sorry you're feeling this way. You don’t have to go through it alone. 💜",
    'emotion': 'sad',
    'suggestions': ['Reach out to a friend', 'Try journaling your feelings', 'Listen to calming music']
},{
    'name': 'stress',
    'patterns': [
        'too much work',
        'cant handle it',
        'overwhelmed with assignments',
        'everything is pressuring me',
        'deadlines stressing me',
        'mind wont stop thinking'
    ],
    'response': "That sounds overwhelming. Let’s slow things down and take one step at a time. 🌿",
    'emotion': 'stressed',
    'suggestions': ['Try deep breathing', 'Break tasks into small steps', 'Take a short break']
},{
    'name': 'anxiety',
    'patterns': [
        'nervous and restless',
        'heart is racing',
        'feel worried',
        'overthinking everything',
        'feel uneasy',
        'cant relax'
    ],
    'response': "I can sense your anxiety. Take a slow breath with me — you are safe right now. 💜",
    'emotion': 'anxious',
    'suggestions': ['Grounding exercise', 'Slow breathing', 'Step away from stress triggers']
},{
    'name': 'neutral_day',
    'patterns': [
        'ordinary day',
        'nothing special happened',
        'just feeling okay',
        'normal day'
    ],
    'response': "Thanks for sharing. Even ordinary days matter — how can I support you today? 🌟",
    'emotion': 'neutral',
    'suggestions': ['Daily check-in', 'Mindfulness moment']
},{
    'name': 'happy',
    'patterns': [
        'really happy',
        'something good happened',
        'feeling excited',
        'feeling motivated',
        'feeling great today'
    ],
    'response': "That’s wonderful to hear! Keep embracing the positive moments. ✨",
    'emotion': 'happy',
    'suggestions': ['Share your win', 'Capture this moment in your journal']
},
{
    'name': 'mixed_emotions',
    'patterns': ['happy but stressed', 'tired and anxious', 'good but worried', 'okay but off'],
    'response': "It sounds like you’re feeling a mix of emotions right now. That’s completely okay — let’s take it one step at a time. 💜",
    'emotion': 'stressed',
    'suggestions': ['Take slow breaths', 'Write your thoughts', 'Break tasks into small steps']
},{
    'name': 'loss_of_interest',
    'patterns': ['lost interest', 'dont enjoy', 'don’t feel like doing anything', 'nothing feels fun'],
    'response': "Sometimes when everything feels heavy, motivation disappears. Be gentle with yourself today. 🌿",
    'emotion': 'sad',
    'suggestions': ['Do one small task', 'Step outside briefly', 'Listen to calming music']
},{
    'name': 'slang_stress',
    'patterns': ['done with everything', 'life is messed up', 'lowkey stressed', 'freaking out', 'feeling meh'],
    'response': "That sounds really overwhelming. Let’s slow things down and focus on one small step right now. 💜",
    'emotion': 'stressed',
    'suggestions': ['Pause and breathe', 'Stretch your body', 'Take a short break']
},{
    'name': 'advice_request',
    'patterns': ['how to calm', 'stop overthinking', 'improve my mood', 'give me motivation', 'what should i do when i feel stressed'],
    'response': "A good first step is to pause, breathe slowly, and focus on what you can control right now. You’ve got this. 🌟",
    'emotion': 'neutral',
    'suggestions': ['Deep breathing', 'Short walk', 'Write your worries down']
},{
    'name': 'daily_triggers',
    'patterns': ['didn’t sleep well', 'failed my test', 'argued with my friend', 'parents disappointed', 'feel homesick'],
    'response': "That sounds tough to go through. Give yourself time to process it — difficult days don’t define you. 💜",
    'emotion': 'sad',
    'suggestions': ['Talk to someone you trust', 'Rest and recharge', 'Be kind to yourself']
},{
    'name': 'hopeless_feelings',
    'patterns': ['no point anymore', 'feel like giving up', 'nothing matters', 'feel trapped'],
    'response': "I’m really sorry you’re feeling this way. You don’t have to go through it alone — reaching out to someone you trust can help. 💜",
    'emotion': 'distress',
    'suggestions': ['Talk to a trusted person', 'Take slow breaths', 'Step into a safe, calm space']
},{
    'name': 'personal_growth',
    'patterns': ['proud of myself', 'improved this week', 'handled stress better', 'stayed calm'],
    'response': "That’s wonderful progress! Recognizing your growth is a powerful step forward. 🌟",
    'emotion': 'happy',
    'suggestions': ['Celebrate your progress', 'Keep the streak going', 'Share your win']
},{
    'name': 'out_of_scope',
    'patterns': [
        '2+2', 'what is 2+2',
        'tell me a joke', 'say a joke', 'make me laugh',
        'who is the president', 'prime minister of india', 'current president',
        'weather today', 'what’s the weather', 'is it raining',
        'tell me the news', 'latest news', 'breaking news',
        'set alarm', 'set a timer', 'remind me to wake up',
        'play music', 'play song', 'open youtube',
        'what time is it', 'current time',
        'who made you', 'are you ai', 'are you human',
        'define photosynthesis', 'solve this equation',
        'translate this', 'spell this word',
        'open google', 'search internet'
    ],
    'response': "I’m here to support your wellbeing and emotions. Tell me how you’re feeling today. 💜",
    'emotion': 'neutral',
    'suggestions': ['Share your mood', 'Daily check-in', 'Try journaling']
}

]

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

        # normalize tokens and punctuation-stripped text for robust matching
        tokens = set(re.findall(r"\b\w+\b", user_lower))
        clean_lower = re.sub(r"[^\w\s]", "", user_lower)

        # Name detection: respond with a friendly welcome when the user provides their name
        name_match = re.search(r"\b(?:my name is|i am|i'm)\s+([A-Za-z'-]+)\b", user_lower)
        if name_match:
            name = name_match.group(1).capitalize()
            if 'your name' in user_lower or 'what is your name' in user_lower:
                return jsonify({
                    'text': f"Nice to meet you, {name}! I'm MindPulse — your wellness companion. 💜",
                    'emotion': 'neutral',
                    'risk': False,
                    'suggestions': ['Daily Check-in', 'Journaling']
                })
            else:
                return jsonify({
                    'text': f"Nice to meet you, {name}! How can I support you today?",
                    'emotion': 'neutral',
                    'risk': False,
                    'suggestions': ['Daily Check-in']
                })

        # 1. IMMEDIATE RISK DETECTION (Safety First)
        # Check phrase keywords against the cleaned text and single-word keywords against token set
        risk_detected = False
        matched_keyword = None
        for keyword in RISK_KEYWORDS:
            if ' ' in keyword:
                if keyword in clean_lower:
                    risk_detected = True
                    matched_keyword = keyword
                    break
            else:
                if keyword in tokens:
                    risk_detected = True
                    matched_keyword = keyword
                    break

        if risk_detected:
            print(f"Risk keyword matched: {matched_keyword}")
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

        # 3. INTENT MATCHING: check expanded intents first, then fallback to GENERAL_RESPONSES
        tokens = set(re.findall(r"\b\w+\b", user_lower))
        clean_lower = re.sub(r"[^\w\s]", "", user_lower)

        # check defined intents
        for intent in INTENT_DEFINITIONS:
            for pattern in intent['patterns']:
                if ' ' in pattern:
                    if pattern in clean_lower:
                        return jsonify({
                            'text': intent['response'],
                            'emotion': intent.get('emotion', 'neutral'),
                            'risk': False,
                            'suggestions': intent.get('suggestions', [])
                        })
                else:
                    if pattern in tokens:
                        return jsonify({
                            'text': intent['response'],
                            'emotion': intent.get('emotion', 'neutral'),
                            'risk': False,
                            'suggestions': intent.get('suggestions', [])
                        })

        # fallback: simple GENERAL_RESPONSES (kept for backwards compatibility)
        for pattern, response in GENERAL_RESPONSES.items():
            if (len(pattern.split()) == 1 and pattern in tokens) or (len(pattern.split()) > 1 and pattern in clean_lower):
                return jsonify({
                    'text': response,
                    'emotion': 'neutral',
                    'risk': False,
                    'suggestions': ['Daily Check-in', 'Journaling']
                })

        # 4. AI Response (OpenAI removed) — use internal fallback intelligence
        # If we reach here, no other intent matched. Use a concise, empathetic fallback.
        emotion = detect_emotion_fallback(user_message)
        suggestion = random.choice(WELLNESS_SUGGESTIONS.get(emotion, WELLNESS_SUGGESTIONS['neutral']))
        if emotion == 'happy':
            ai_text = f"I'm glad to hear that 🌟 — consider {suggestion}."
        elif emotion == 'sad':
            ai_text = f"I hear you 💜 — try {suggestion} to help a bit."
        elif emotion in ('stressed', 'anxious'):
            ai_text = f"That sounds tough 🌿 — {suggestion} might help."
        else:
            ai_text = f"Thanks for sharing — {suggestion} could be useful."

        return jsonify({
            'text': ai_text,
            'emotion': emotion,
            'risk': False,
            'suggestions': WELLNESS_SUGGESTIONS.get(emotion, ['Breathing', 'Journaling'])
        })

    except Exception as e:
        print(f"Server Error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Run on port 5001 to avoid conflict with Node backend/frontend default ports
    app.run(port=5001, debug=True)