from collections import defaultdict


def build_student_analytics(logs):
    total = len(logs)
    correct = sum(1 for log in logs if log.is_correct)
    avg_time = sum(log.time_taken for log in logs) / total if total else 0
    topic_stats = defaultdict(lambda: {"total": 0, "correct": 0, "time": 0})
    changes = sum(log.answer_changes for log in logs)
    revisits = sum(log.revisit_count for log in logs)
    tab_switches = sum(log.tab_switches for log in logs)
    inactivity = sum(log.inactivity_seconds for log in logs)

    for log in logs:
        topic = log.question.topic
        topic_stats[topic]["total"] += 1
        topic_stats[topic]["correct"] += int(log.is_correct)
        topic_stats[topic]["time"] += log.time_taken

    topics = []
    for topic, data in topic_stats.items():
        total_topic = data["total"]
        topics.append({
            "topic": topic,
            "accuracy": round(data["correct"] / total_topic, 2) if total_topic else 0,
            "avg_time": round(data["time"] / total_topic, 2) if total_topic else 0,
            "questions": total_topic
        })

    insights = []
    for item in topics:
        if item["accuracy"] < 0.55 and item["avg_time"] < 30:
            insights.append(f"You rush in {item['topic']}")
        if item["accuracy"] < 0.55 and item["avg_time"] > 75:
            insights.append(f"You overthink {item['topic']}")
        if item["accuracy"] >= 0.8:
            insights.append(f"{item['topic']} is a strong area")

    if changes >= max(3, total):
        insights.append("Frequent answer changes suggest uncertainty")
    if tab_switches >= 2:
        insights.append("Multiple tab switches were detected during testing")
    if inactivity > 90:
        insights.append("Long inactivity periods may affect score reliability")

    return {
        "accuracy": round(correct / total, 2) if total else 0,
        "avg_time": round(avg_time, 2),
        "total_questions": total,
        "correct": correct,
        "topic_stats": topics,
        "behavior": {
            "answer_changes": changes,
            "revisits": revisits,
            "tab_switches": tab_switches,
            "inactivity_seconds": round(inactivity, 2)
        },
        "insights": insights
    }


def recommendations(analytics):
    weak = [item for item in analytics["topic_stats"] if item["accuracy"] < 0.65]
    slow = [item for item in analytics["topic_stats"] if item["avg_time"] > 70]
    result = []
    for item in weak[:3]:
        result.append({"type": "revision", "topic": item["topic"], "message": f"Revise {item['topic']} fundamentals and try easy-to-medium drills"})
    for item in slow[:2]:
        result.append({"type": "speed", "topic": item["topic"], "message": f"Practice timed questions in {item['topic']}"})
    if analytics["accuracy"] >= 0.8 and analytics["avg_time"] < 45:
        result.append({"type": "difficulty", "topic": "overall", "message": "Move to harder adaptive tests"})
    if not result:
        result.append({"type": "practice", "topic": "overall", "message": "Continue mixed practice to maintain consistency"})
    return result

