import requests

def get_random_joke():
    url = "https://v2.jokeapi.dev/joke/any"
    try:
        response = requests.get(url)
        response.raise_for_status()
        joke_data = response.json()

        if joke_data['type'] == 'single':
            return joke_data.get('joke', 'No joke found.')
        elif joke_data['type'] == 'twopart':
            setup = joke_data.get('setup', '')
            delivery = joke_data.get('delivery', '')
            return f"{setup}\n{delivery}"
        else:
            return "No joke found."
    except requests.RequestException as e:
        return f"Error fetching joke: {e}"


def get_one_fact(api_key):
    url = "https://api.api-ninjas.com/v1/facts"
    headers = {
        "X-Api-Key": api_key
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        fact = response.json()[0]['fact']
        return fact
    except requests.RequestException as e:
        return f"Error fetching fact: {e}"

if __name__ == "__main__":
    print(get_random_joke())
    api_key = "bNnq+iUY1JqBvm5CzS4DcQ==KfjZtD8ZFa4sl8af"
    print(get_one_fact(api_key))
