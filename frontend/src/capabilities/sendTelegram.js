import useTelegramStore from '../stores/telegramStore'

async function sendTelegramMessage(message) {
    const BOT_TOKEN = useTelegramStore.getState().botToken;
    const CHAT_ID = useTelegramStore.getState().chartId;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message
            })
        });

        const data = await response.json();

        if (data.ok) {
            console.log("Message sent successfully!");
        } else {
            console.error("Telegram error:", data);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}

export default sendTelegramMessage;