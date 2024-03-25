        document.addEventListener('DOMContentLoaded', () => {
            const newsContainer = document.getElementById('news-container');
            const loadMoreBtn = document.getElementById('load-more-btn');
            let startIndex = 0;
            const batchSize = 10;

            // Funzione per fetchare
            function callFetch(url) {
                return fetch(url)
                    .then(response => response.json());
            }

            // Funzione per fetchare i dettagli dell'API globale
            function getNews(ids) {
                const promises = ids.slice(startIndex, startIndex + batchSize)
                    .map(id => callFetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`));

                Promise.all(promises)
                    .then(news => {
                        getNewsOnScreen(news);
                    })
                    .catch(error => console.error('Error fetching news:', error));
            }

            // Funzione per ottenere una foto da Pexels basata sul titolo
            function getPhotoFromTitle(title) {
                const apiKey = 'PjkpjWJTw8yIKV65mcBUFN7BC4J60u6r325YXWGCHeCIlEDpxFBS8EHo';
                const searchUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(title)}&per_page=1`;

                return fetch(searchUrl, {
                    headers: {
                        Authorization: apiKey
                    }
                })
                    .then(response => response.json())
                    .then(data => data.photos.length > 0 ? data.photos[0].src.large : null)
                    .catch(error => {
                        console.error('Error fetching photo from Pexels:', error);
                        return null;
                    });
            }

            // Funzione che renderizza le notizie
            function getNewsOnScreen(newsArray) {
                const row = document.createElement('div');
                row.className = 'row mt-6';
                newsArray.forEach(async item => {
                    const newsItem = document.createElement('div');
                    newsItem.className = 'col-md-6';
                    const imageUrl = await getPhotoFromTitle(item.title);
                    if (imageUrl) {
                        newsItem.innerHTML = `
                            <div class=" card mb-6">
                                <img src="${imageUrl}" class="align-self-center card-img-top" alt="image from Pexels">
                                <div class="card-body">
                                    <h5 class="card-title">${item.title}</h5>
                                    <a href="${item.url}" class="btn btn-info">Read</a>
                                    <p class="card-text mt-2">Date: ${new Date(item.time * 1000).toLocaleString()}</p>
                                </div>
                            </div>`;
                    } else {
                        newsItem.innerHTML = `
                            <div class="card mb-6">
                                <div class="card-body">
                                    <h5 class="card-title">${item.title}"</h5>
                                    <a href="${item.url}" class="btn btn-primary">Read</a>
                                    <p class="card-text mt-6">Date: ${new Date(item.time * 1000).toLocaleString()}</p>
                                    
                                </div>
                                <hr>
                            </div>`;
                    }
                    row.appendChild(newsItem);
                });
                newsContainer.appendChild(row);
            }

            // Richiamo la function per fetchare l'API globale
            callFetch('https://hacker-news.firebaseio.com/v0/newstories.json')
                .then(newsIds => {

                    // Richiamo la function che carica le prime 10 notizie
                    getNews(newsIds);
                    startIndex += batchSize;

                    // Aggiunta dell'handler per il pulsante "Load more"
                    loadMoreBtn.addEventListener('click', () => {
                        getNews(newsIds);
                        startIndex += batchSize;
                    });
                })
                .catch(error => console.error('Error fetching news IDs:', error));
        });