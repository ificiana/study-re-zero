document.addEventListener('DOMContentLoaded', function() {
    let studiedData = JSON.parse(localStorage.getItem('studiedData')) || {};
    const urlParams = new URLSearchParams(window.location.search);
    const kanjiFilter = urlParams.get('k');
    
    createContent(wordsData, studiedData, kanjiFilter);

    document.getElementById('loadData').addEventListener('click', function() {
        localStorage.setItem('wordsData', JSON.stringify(wordsData));
        alert('Data loaded to localStorage');
    });

    document.getElementById('exportData').addEventListener('click', function() {
        let studiedData = JSON.parse(localStorage.getItem('studiedData')) || {};
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(studiedData));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "studied.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    function createContent(wordsData, studiedData, kanjiFilter) {
        const toc = document.getElementById('toc');
        const content = document.getElementById('content');

        Object.keys(wordsData).forEach(kanji => {
            const tocEntry = document.createElement('div');
            tocEntry.innerHTML = `<a href="?k=${kanji}#${kanji}">${kanji}</a>`;
            toc.appendChild(tocEntry);
        });

        const kanji = kanjiFilter;

        const kanjiSection = document.createElement('div');
        kanjiSection.classList.add('kanji-section');
        kanjiSection.id = kanji;

        const h1 = document.createElement('h1');
        h1.textContent = kanji;
        kanjiSection.appendChild(h1);

        const ul = document.createElement('ul');

        if (!kanjiFilter || kanjiFilter === kanji) {
            wordsData[kanji].forEach(word => {
                if (!studiedData[kanji] || !studiedData[kanji].includes(word)) {
                    const li = document.createElement('li');
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.addEventListener('click', () => handleCheckboxClick(kanji, word));
                    li.appendChild(checkbox);
                    li.appendChild(document.createTextNode(` ${word}`));
                    ul.appendChild(li);
                }
            });

            kanjiSection.appendChild(ul);
            content.appendChild(kanjiSection);
        }
    }

    function handleCheckboxClick(kanji, word) {
        let studiedData = JSON.parse(localStorage.getItem('studiedData')) || {};

        if (!studiedData[kanji]) {
            studiedData[kanji] = [];
        }
        studiedData[kanji].push(word);

        localStorage.setItem('studiedData', JSON.stringify(studiedData));
        location.reload();
    }
});
