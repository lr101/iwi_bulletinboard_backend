const { initializeApp } = require("firebase-admin/app");
const { credential, messaging } = require("firebase-admin");
const path = require('path');

const serviceAccount = require(path.join(__dirname, 'secret.json'));

const INFM_TOPIC = "INFM"
const INFB_TOPIC = "INFB"
const MINB_TOPIC = "MINB"
const MKIB_TOPIC = "MKIB"
const REST_URL = 'https://raumzeit.hka-iwi.de/api/v1/newsbulletinboard/public/courseofstudy/';

// Urls
const rssFeedUrls = {
    [INFM_TOPIC]: REST_URL + INFM_TOPIC,
    [INFB_TOPIC]: REST_URL + INFB_TOPIC,
    [MINB_TOPIC]: REST_URL + MINB_TOPIC,
    [MKIB_TOPIC]: REST_URL + MKIB_TOPIC
};

// Keep track of processed item IDs for each topic
let processedItemIds = {
    [INFM_TOPIC]: [],
    [INFB_TOPIC]: [],
    [MINB_TOPIC]: [],
    [MKIB_TOPIC]: []
};

// Function to send message to FCM
async function sendMessageToFCM(title, content, topic) {
    const message = {
        notification: {
            title: title,
            body: content
        },
        topic: topic
    };

    try {
        const response = await messaging().send(message);
        console.log('Message sent successfully:', response);
    } catch (error) {
        console.error('Error sending message:', error);
    }
}



// Function to fetch and parse RSS feed
async function fetchAndParseRSSFeed(feedUrl, topic) {
    try {
        console.info("GET " + feedUrl);
        const response = await fetch(feedUrl);
        const feed = await response.json()
        if (feed && feed.length > 0) {
            for (const item of feed) {
                if (!processedItemIds[topic].includes(item.id)) {
                    await sendMessageToFCM(item.title, item.content, topic);
                    processedItemIds[topic].push(item.id);
                }
            }
        } else {
            console.error('No items found in the RSS feed:', feedUrl);
        }
    } catch (error) {
        console.error('Error fetching or parsing RSS feed:', error);
    }
}

async function fetchAll() {
    for (const topic in rssFeedUrls) {
        const feedUrl = rssFeedUrls[topic]
        try {
            console.info("GET " + feedUrl);
            const response = await fetch(feedUrl);
            const feed = await response.json()
            if (feed && feed.length > 0) {
                for (const item of feed) {
                    processedItemIds[topic].push(item.id);
                }
            } else {
                console.error('No items found in the RSS feed:', feedUrl);
            }
        } catch (error) {
            console.error('Error fetching or parsing RSS feed:', error);
        }
    }
}

// <-------------------------- Start ----------------------->

// Initialize Firebase Admin SDK
initializeApp({
    credential: credential.cert(serviceAccount)
});

// preload feed
fetchAll().then(() =>
    // set interval
    setInterval(() =>  {
        for (const topic in rssFeedUrls) {
            fetchAndParseRSSFeed(rssFeedUrls[topic], topic);
        }
    }, process.env.fetchTime * 1000)
)



