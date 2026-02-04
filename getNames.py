import requests

file_name = 'characterNames'
BASE_URL = "https://myheroacademia.fandom.com/api.php"

params = {
    "action": "query",
    "list": "categorymembers",
    "cmtitle": "Category:Characters",  # put your actual category name here
    "cmlimit": "500",
    "format": "json"
}

all_titles = []
continue_token = {}

while True:
    res = requests.get(BASE_URL, params={**params, **continue_token})
    data = res.json()
    
    # add each title
    for page in data["query"]["categorymembers"]:
        if not page["title"].startswith("Category:"):
            all_titles.append(page["title"])
            with open(file_name, 'a', encoding='utf-8') as file:
                file.write(page['title'])
                file.write('\n')
    
    if "continue" in data:
        continue_token = data["continue"]
    else:
        break

print(f"Found characters: {len(all_titles)}")


