import matplotlib.pyplot as plt
from collections import defaultdict

def generate_feedback(avg_emotions, smile_percentage):
    """Generate actionable interview feedback."""
    feedback = []
    if smile_percentage < 30:
        feedback.append("Try smiling more naturally to appear confident.")
    if avg_emotions.get('neutral',0) > 50:
        feedback.append("Show more enthusiasm; avoid being too neutral.")
    if avg_emotions.get('fear',0) > 10:
        feedback.append("Nervousness detected; practice mock interviews to stay calm.")
    if not feedback:
        feedback.append("Good emotional balance. You appear confident and engaged.")
    return feedback

def plot_emotion_timeline(emotions_over_time):
    """Plot emotion confidence over time."""
    if not emotions_over_time:
        return
    times = [e['time'] for e in emotions_over_time]
    plt.figure(figsize=(10,5))
    for emotion in ['happy','neutral','sad','angry','fear','surprise','disgust']:
        plt.plot(times, [e[emotion] for e in emotions_over_time], label=emotion)
    plt.xlabel("Time (s)")
    plt.ylabel("Emotion Confidence (%)")
    plt.title("Emotion Timeline During Interview")
    plt.legend()
    # plt.show()
