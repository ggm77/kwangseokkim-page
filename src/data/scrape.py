import urllib.request
import re
import json

songs = {}

# We'll check pages 1 to 5 to see if we get all songs.
for page in range(1, 10):
    url = f"https://kimkwangseok.com/bbs/board.php?bo_table=music&page={page}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
    except Exception as e:
        print(f"Error reading page {page}: {e}")
        continue
    
    # Looking for links to song details
    links = re.findall(r'href="([^"]+bo_table=music&amp;wr_id=\d+(?:&amp;page=\d+)?)"', html)
    links = list(set(links)) # unique links
    print(f"Page {page} links: {links}")
    
    if not links:
        break
        
    for link in links:
        link = link.replace('&amp;', '&')
        try:
            req_detail = urllib.request.Request(link, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req_detail) as response_detail:
                detail_html = response_detail.read().decode('utf-8')
                
                # Extract title
                title_match = re.search(r'<title>([^<]+)</title>', detail_html)
                if title_match:
                    title = title_match.group(1).split('>')[-1].replace('- 김광석닷컴', '').strip()
                    # The title might look like "서른 즈음에 > 음반 - 김광석닷컴"
                    if " > " in title:
                        title = title.split(" > ")[0].strip()
                else:
                    title = "Unknown"
                    print(f"No title found for {link}")
                    
                # Extract lyrics.
                # Let's try a broader search for content.
                content_match = re.search(r'id="bo_v_con"[^>]*>(.*?)</div>\s*<!-- } 본문 내용 끝 -->', detail_html, re.DOTALL | re.IGNORECASE)
                
                if content_match:
                    lyrics_html = content_match.group(1)
                    # basic html to text
                    lyrics = re.sub(r'<br\s*/?>', '\n', lyrics_html)
                    lyrics = re.sub(r'<p[^>]*>', '', lyrics)
                    lyrics = re.sub(r'</p>', '\n', lyrics)
                    lyrics = re.sub(r'<[^>]+>', '', lyrics)
                    lyrics = lyrics.strip()
                    
                    if title and lyrics:
                        songs[title] = lyrics
                        print(f"Scraped: {title}")
                else:
                    print(f"No lyrics found for {link}")
        except Exception as e:
            print(f"Error reading {link}: {e}")

with open('lyrics_scraped.json', 'w', encoding='utf-8') as f:
    json.dump(songs, f, ensure_ascii=False, indent=4)

print(f"Total songs scraped: {len(songs)}")
