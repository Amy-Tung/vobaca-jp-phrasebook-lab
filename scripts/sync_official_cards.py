import json,time
from datetime import datetime,timezone
from pathlib import Path
import requests

API='https://www.takaratomy.co.jp/products/haikyuvobacabreak/cardlist/itemsearch.php'
HEADERS={'User-Agent':'Mozilla/5.0 (compatible; VobacaPhrasebook/1.0)','Referer':'https://www.takaratomy.co.jp/products/haikyuvobacabreak/cardlist/'}
all_items=[]
page=1
total=None
while True:
    response=requests.get(API,params={'p':page},headers=HEADERS,timeout=30)
    response.raise_for_status()
    data=response.json()
    items=data.get('items',[])
    if total is None: total=int(data.get('count',0) or 0)
    if not items: break
    all_items.extend(items)
    if total and len(all_items)>=total: break
    page+=1
    time.sleep(.4)
unique={str(x.get('ID')):x for x in all_items if x.get('ID') is not None}
cards=[]
for x in unique.values():
    cards.append({k:x.get(k,'') for k in ('ID','card_no','name','name_ruby','affiliation','category')})
payload={'source':API,'updatedAt':datetime.now(timezone.utc).isoformat(),'count':len(cards),'cards':cards}
out='window.OFFICIAL_CARDS_DATA='+json.dumps(payload,ensure_ascii=False,separators=(',',':'))+';\n'
Path('official-cards-data.js').write_text(out,encoding='utf-8')
print(f'wrote {len(cards)} official card variants from {page} page(s)')
