import json
import time
from datetime import datetime, timezone
from pathlib import Path
import requests

API = 'https://www.takaratomy.co.jp/products/haikyuvobacabreak/cardlist/itemsearch.php'
HEADERS = {'User-Agent': 'Mozilla/5.0 (compatible; VobacaPhrasebook/1.0)', 'Referer': 'https://www.takaratomy.co.jp/products/haikyuvobacabreak/cardlist/'}
items_by_id = {}
total = None
for page in range(1, 101):
    response = requests.get(API, params={'p': page}, headers=HEADERS, timeout=30)
    response.raise_for_status()
    data = response.json()
    if not isinstance(data, dict) or not isinstance(data.get('items'), list):
        raise RuntimeError('Unexpected official response; previous data retained.')
    if total is None:
        total = int(data.get('count', 0) or 0)
        if total <= 0:
            raise RuntimeError('Official count is missing or empty; previous data retained.')
    before = len(items_by_id)
    for item in data['items']:
        if isinstance(item, dict) and item.get('ID') is not None:
            items_by_id[str(item['ID'])] = item
    if len(items_by_id) >= total:
        break
    if not data['items'] or len(items_by_id) == before:
        raise RuntimeError('Incomplete official data; previous data retained.')
    time.sleep(0.6)
else:
    raise RuntimeError('Pagination limit exceeded; previous data retained.')
# Preserve official metadata, including position and card subtype; do not infer it.
cards = list(items_by_id.values())
if not any(c.get('category') == 'CHARACTER' and c.get('name') for c in cards):
    raise RuntimeError('No character cards found; previous data retained.')
path = Path('official-cards-data.js')
if path.exists():
    try:
        previous = json.loads(path.read_text(encoding='utf-8').split('=', 1)[1].rstrip().rstrip(';'))
        if previous.get('cards') == cards:
            print('Official data unchanged.')
            raise SystemExit(0)
    except (ValueError, IndexError):
        pass
payload = {'source': API, 'updatedAt': datetime.now(timezone.utc).isoformat(), 'count': len(cards), 'cards': cards}
temporary = path.with_suffix('.tmp')
temporary.write_text('window.OFFICIAL_CARDS_DATA=' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
temporary.replace(path)
print(f'Saved {len(cards)} official cards from {page} page(s).')
