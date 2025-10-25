def fetch_questionnaire(name):
    if name == "PHQ-9":
        return [
            {"id": 1, "question": "Little interest or pleasure in doing things?", "options": [0, 1, 2, 3]},
            {"id": 2, "question": "Feeling down, depressed, or hopeless?", "options": [0, 1, 2, 3]},
            {"id": 3, "question": "Trouble falling or staying asleep, or sleeping too much?", "options": [0, 1, 2, 3]},
            {"id": 4, "question": "Feeling tired or having little energy?", "options": [0, 1, 2, 3]},
            {"id": 5, "question": "Poor appetite or overeating?", "options": [0, 1, 2, 3]},
            {"id": 6, "question": "Feeling bad about yourself, or that you are a failure?", "options": [0, 1, 2, 3]},
            {"id": 7, "question": "Trouble concentrating on things?", "options": [0, 1, 2, 3]},
            {"id": 8, "question": "Moving or speaking so slowly that other people could have noticed?", "options": [0, 1, 2, 3]},
            {"id": 9, "question": "Thoughts that you would be better off dead or hurting yourself?", "options": [0, 1, 2, 3]},
        ]

    elif name == "GAD-7":
        return [
            {"id": 1, "question": "Feeling nervous, anxious, or on edge?", "options": [0, 1, 2, 3]},
            {"id": 2, "question": "Not being able to stop or control worrying?", "options": [0, 1, 2, 3]},
            {"id": 3, "question": "Worrying too much about different things?", "options": [0, 1, 2, 3]},
            {"id": 4, "question": "Trouble relaxing?", "options": [0, 1, 2, 3]},
            {"id": 5, "question": "Being so restless that it's hard to sit still?", "options": [0, 1, 2, 3]},
            {"id": 6, "question": "Becoming easily annoyed or irritable?", "options": [0, 1, 2, 3]},
            {"id": 7, "question": "Feeling afraid as if something awful might happen?", "options": [0, 1, 2, 3]},
        ]

    elif name == "PSS":
        return [
            {"id": 1, "question": "In the last month, how often have you been upset because of something that happened unexpectedly?", "options": [0, 1, 2, 3, 4]},
            {"id": 2, "question": "In the last month, how often have you felt that you were unable to control important things in your life?", "options": [0, 1, 2, 3, 4]},
            {"id": 3, "question": "In the last month, how often have you felt nervous and stressed?", "options": [0, 1, 2, 3, 4]},
            {"id": 4, "question": "In the last month, how often have you felt confident about your ability to handle your personal problems?", "options": [0, 1, 2, 3, 4]},
            {"id": 5, "question": "In the last month, how often have you felt that things were going your way?", "options": [0, 1, 2, 3, 4]},
            {"id": 6, "question": "In the last month, how often have you found that you could not cope with all the things that you had to do?", "options": [0, 1, 2, 3, 4]},
            {"id": 7, "question": "In the last month, how often have you been able to control irritations in your life?", "options": [0, 1, 2, 3, 4]},
            {"id": 8, "question": "In the last month, how often have you felt that you were on top of things?", "options": [0, 1, 2, 3, 4]},
            {"id": 9, "question": "In the last month, how often have you been angered because of things that were outside of your control?", "options": [0, 1, 2, 3, 4]},
            {"id": 10, "question": "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?", "options": [0, 1, 2, 3, 4]},
        ]

    else:
        return []

def collect_answers(questions):
    answers = []
    print("Please answer each question with a number from the options provided:")
    for q in questions:
        while True:
            try:
                ans = int(input(f"{q['question']} (Options: {q['options']}): "))
                if ans in q['options']:
                    answers.append(ans)
                    break
                else:
                    print(f"Invalid input, enter one of {q['options']}.")
            except ValueError:
                print("Invalid input. Please enter a number.")
    return answers

def score_assessment(name, answers):
    total_score = sum(answers)
    return total_score

def interpret_score(name, score):
    if name == "PHQ-9":
        if score <= 4:
            return "Minimal depression"
        elif score <= 9:
            return "Mild depression"
        elif score <= 14:
            return "Moderate depression"
        elif score <= 19:
            return "Moderately severe depression"
        else:
            return "Severe depression"

    elif name == "GAD-7":
        if score <= 4:
            return "Minimal anxiety"
        elif score <= 9:
            return "Mild anxiety"
        elif score <= 14:
            return "Moderate anxiety"
        else:
            return "Severe anxiety"

    elif name == "PSS":
        if score <= 13:
            return "Low stress"
        elif score <= 26:
            return "Moderate stress"
        else:
            return "High perceived stress"

    else:
        return "Unknown assessment"

def run_assessment(name):
    questions = fetch_questionnaire(name)
    if not questions:
        print("Questionnaire not found.")
        return

    print(f"Running {name} assessment...")
    answers = collect_answers(questions)
    score = score_assessment(name, answers)
    interpretation = interpret_score(name, score)

    print(f"\nTotal Score: {score}")
    print(f"Assessment Result: {interpretation}")

if __name__ == "__main__":
    # Example usage: run all three assessments one by one
    for test_name in ["PHQ-9", "GAD-7", "PSS"]:
        run_assessment(test_name)
        print("\n" + "-"*40 + "\n")
