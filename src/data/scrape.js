import fs from 'fs';

async function fetchHtml(url) {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    return res.text();
}

async function scrape() {
    const songs = {};
    const baseUrl = 'https://kimkwangseok.com/bbs/board.php?bo_table=music';
    
    console.log("Starting scrape...");
    
    for (let page = 1; page <= 5; page++) {
        const url = `${baseUrl}&page=${page}`;
        const html = await fetchHtml(url);
        
        // Find links
        const regex = /href="([^"]+bo_table=music&amp;wr_id=\d+(?:&amp;page=\d+)?)"/g;
        let match;
        const links = new Set();
        while ((match = regex.exec(html)) !== null) {
            links.add(match[1].replace(/&amp;/g, '&'));
        }
        
        console.log(`Page ${page}: found ${links.size} links`);
        
        for (const link of links) {
            try {
                const detailHtml = await fetchHtml(link);
                
                // Extract Title
                const titleMatch = detailHtml.match(/<title>([^<]+)<\/title>/);
                let title = "Unknown";
                if (titleMatch) {
                    title = titleMatch[1].split('>').pop().replace('- 김광석닷컴', '').trim();
                }
                
                // Extract Lyrics
                const contentMatch = detailHtml.match(/id="bo_v_con"[^>]*>([\s\S]*?)<\/div>\s*<!-- } 본문 내용 끝 -->/i);
                if (contentMatch) {
                    let lyricsHtml = contentMatch[1];
                    let lyrics = lyricsHtml.replace(/<br\s*\/?>/gi, '\n');
                    lyrics = lyrics.replace(/<p[^>]*>/gi, '');
                    lyrics = lyrics.replace(/<\/p>/gi, '\n');
                    lyrics = lyrics.replace(/<[^>]+>/g, '');
                    lyrics = lyrics.trim();
                    
                    if (title && lyrics && lyrics.length > 10) {
                        songs[title] = lyrics;
                        console.log(`Scraped: ${title}`);
                    }
                }
            } catch (e) {
                console.error(`Error fetching ${link}: ${e.message}`);
            }
        }
    }
    
    fs.writeFileSync('lyrics_scraped.json', JSON.stringify(songs, null, 2), 'utf8');
    console.log(`Total scraped: ${Object.keys(songs).length}`);
}

scrape();
