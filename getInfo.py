import requests
import re
import json

BASE_URL = "https://myheroacademia.fandom.com/api.php"

# ------------------ REGEX CONSTANTS ------------------

FIELD_END = r"(?=\n\|\s*[a-zA-Z_]+\s*=|\n\}\})"
SPLIT_PATTERN = re.compile(r"<br\s*/?>|\n|\*")

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

# ------------------ CLEANERS ------------------

def clean_wiki_text(value):
    if not value:
        return None

    # Remove templates completely
    value = re.sub(r"\{\{[^}]+\}\}", "", value)

    # Remove wiki links
    value = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]+)\]\]", r"\1", value)

    # Remove HTML
    value = re.sub(r"<.*?>", "", value)

    value = value.replace("|", "").strip()

    # ❌ Reject field bleed-through like "gender = Male"
    if re.search(r"\b[a-zA-Z_]+\s*=", value):
        return None

    return value or None


# ------------------ EXTRACTORS ------------------

def extract_block(text, field):
    pattern = (
        r"\|\s*" + re.escape(field) + r"\s*=\s*"
        r"(.*?)" + FIELD_END
    )
    match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
    return match.group(1) if match else None


def extract_single(text, *fields):
    for field in fields:
        raw = extract_block(text, field)
        clean = clean_wiki_text(raw)
        if clean:
            return clean
    return None


def extract_multi(text, *fields):
    for field in fields:
        raw = extract_block(text, field)
        if not raw:
            continue

        parts = SPLIT_PATTERN.split(raw)
        cleaned = []

        for part in parts:
            clean = clean_wiki_text(part)
            if not clean or "=" in clean:
                continue
            cleaned.append(clean)

        if cleaned:
            return list(dict.fromkeys(cleaned))
    return None



# ------------------ NORMALIZERS ------------------

def extract_number(value):
    match = re.search(r"\d+", value or "")
    return int(match.group()) if match else None


def extract_anime_debut(text):
    """Extract official anime debut from character infobox."""
    raw = extract_block(text, "debutanime")
    if not raw:
        raw = extract_block(text, "anime debut")
    
    if not raw:
        return None
    
    # Split by newlines to handle multiple debuts
    lines = [line.strip() for line in raw.split('\n') if line.strip()]
    
    for line in lines:
        # Look for the official debut line
        if "official" in line.lower():
            # Remove wiki links and templates
            clean = clean_wiki_text(line)
            if clean:
                # Remove the parenthetical part (Official debut)
                clean = re.sub(r'\s*\([^)]*\)', '', clean).strip()
                return clean
    
    # If no official debut found, return the last non-empty line cleaned
    if lines:
        clean = clean_wiki_text(lines[-1])
        if clean:
            # Remove the parenthetical part
            clean = re.sub(r'\s*\([^)]*\)', '', clean).strip()
            return clean
    
    return None


# ------------------ CHARACTER PARSER ------------------

def get_character_info(name):
    params = {
        "action": "parse",
        "page": name.replace(" ", "_"),
        "prop": "wikitext",
        "format": "json"
    }

    try:
        res = requests.get(BASE_URL, params=params, headers=HEADERS, timeout=15)
        text = res.json()["parse"]["wikitext"]["*"]
    except Exception:
        return None

    image_url = get_character_image(name)

    info = {
        "character_name": name,
        "image": image_url,
        "height_cm": extract_number(extract_single(text, "height", "height_cm")),
        "age": extract_number(extract_single(text, "age")),
        "gender": extract_single(text, "gender"),
        "occupation": extract_multi(text, "occupation"),
        "affiliation": extract_multi(text, "affiliation"),
        "quirk": extract_single(text, "quirk"),
        "anime_debut": extract_anime_debut(text)
    }


    info = {k: v for k, v in info.items() if v is not None}
    return info if len(info) >= 9 else None

def get_character_image(name):
    params = {
        "action": "query",
        "titles": name.replace(" ", "_"),
        "prop": "pageimages",
        "pithumbsize": 500,
        "format": "json"
    }

    try:
        res = requests.get(BASE_URL, params=params, headers=HEADERS, timeout=15)
        pages = res.json()["query"]["pages"]

        for page in pages.values():
            if "thumbnail" in page:
                return page["thumbnail"]["source"]
    except Exception:
        pass

    return None


# ------------------ RUN ------------------

with open("characterNames", encoding="utf-8") as f:
    characters = [line.strip() for line in f if line.strip()]

results = []

for i, character in enumerate(characters, start=1):
    info = get_character_info(character)
    if info:
        results.append(info)
        print(f"[{i}] Saved: {character}")
    else:
        print(f"[{i}] Skipped: {character}")

with open("characterInfo.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
