function shiftSet(set) {
    for (const value of set) {
        set.delete(value);
        return value;
    }
}

class Links {
    constructor() {
        this.links = new Set();
        this.completed = new Set();
        this.paused = false;
        this.onLinkCompleted = null;
    }

    push(link) {
        if (!this.links.has(link) && !this.completed.has(link)) {
            this.links.add(link);
        }
    }

    async pop() {
        while (this.paused || this.links.size === 0) {
            await new Promise((resolve) => setTimeout(resolve, 1));
        }

        const link = shiftSet(this.links);
        this.completed.add(link);

        if (this.onLinkCompleted) {
            await this.onLinkCompleted(link);
        }

        return link;
    }

    async batchPop() {
        const size = 50;
        const batchPromises = [];

        for (let i = 0; i < size; i++) {
            batchPromises.push(this.pop());
        }

        try {
            const results = await Promise.all(batchPromises);
            return results;
        } catch (error) {
            console.error("Error popping items:", error);
        }
    }

    pause() {
        this.paused = true;
        const status = document.getElementById("status");
        status.innerHTML = "Paused";
    }

    resume() {
        this.paused = false;
        const status = document.getElementById("status");
        status.innerHTML = "Downloading...";
    }

    get total() {
        return this.links.size + this.completed.size;
    }

    get progress() {
        return this.completed.size / this.total;
    }
}

const links = new Links();

const pauseButton = (button) => {
    links.pause();
    button.onclick = () => links.resume();
};

async function makeOffline(button) {
    button.innerHTML = `<span id="status">Preparing...</span>
                Progress: <span id="progress">0</span>%`;
    button.disabled = true;
    const progressVal = document.getElementById("progress");
    const len = Object.keys(wordsData).length;

    await new Promise((r) => setTimeout(r, 1000));
    let prepared = 0;

    for (const k in wordsData) {
        const vList = wordsData[k];
        const link1 = `https://ificiana.github.io/study-re-zero/index.html?k=${k}&cache#${k}`;
        const link2 = `https://ificiana.github.io/study-re-zero/?k=${k}&cache#${k}`;
        const link3 = `https://ificiana.github.io/study-re-zero/index.html?k=${k}&cache#${k}`;
        const link4 = `https://www.kanshudo.com/kanji/${k}`;
        links.push(link1);
        links.push(link2);
        links.push(link3);
        links.push(link4);
        vList.forEach((v) => {
            const link5 = `https://www.kanshudo.com/word/${v}`;
            links.push(link5);
        });
        prepared++;
        progressVal.innerHTML = ((prepared / len) * 100).toFixed(2);
        await new Promise((r) => setTimeout(r, 1));
    }

    button.innerHTML = `<span id="status">Downloading...</span>
                Progress: <span id="progress">0</span>%`;
    button.onclick = () => pauseButton(button);
    button.disabled = false;

    await fetchLinks(links)
        .then(() => console.log("All links fetched"))
        .catch((error) => console.error("Error fetching links:", error));

    button.innerHTML = "Make Offline";
    alert("All links have been processed. Check the console for details.");
}

async function fetchLink(link) {
    try {
        const response = await fetch(link, { mode: "no-cors" });
        if (response.status === 429) {
            // If response is 429, remove from completed and retry by pushing it back to links
            console.log(`Rate limited (429) for ${link}`);
            links.completed.delete(link);
            links.push(link);
        } else {
            console.log(`Fetched ${link}`);
            links.completed.add(link);
        }
        const progressVal = document.getElementById("progress");
        progressVal.innerHTML = `${(
            (this.completed.size / this.total) *
            100
        ).toFixed(2)}`;
    } catch (error) {
        console.error(`Failed to fetch ${link}: ${error}`);
    }
}

async function fetchLinks(links) {
    links.onLinkCompleted = fetchLink;
    while (links.completed != links.total) {
        const batchPromises = [];
        for (let i = 0; i < 8; i++) {
            batchPromises.push(links.batchPop());
        }
        await Promise.all(batchPromises);
    }
}
