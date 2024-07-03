document.addEventListener('DOMContentLoaded', (event) => {
    const consoleOutput = document.getElementById('consoleOutput');

    function logToConsole(message) {
        const consoleOutput = document.getElementById('consoleOutput');
        const newMessage = document.createElement('div');
        newMessage.textContent = message;
        consoleOutput.appendChild(newMessage);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }


    const encryptedKeys = 'U2FsdGVkX1+IfWo59g5FiUoxZmEQStoNULl8H9CUTukPjRUIPEkHjPL/Cenxulg5qteD5OoyysjE0XUqWZUB6wNRuRaNMR7nYKYUY1iqyb1XMp8nYi44bW8wOj4M8irTxNDr0pPQVdcVPDvXNYlryM6dSN9y3maAB9lrttvZTr0+SgPWfuxaEU6P6l4nJ5GOGbr1Lndso9n+jPwfLmKoCik6ntYc2rbcx7bT4VZWWDOk26NE/Via9LHYw0HK5T+NgtlQcTNdhndMTRALkWtAAya6oqR7bSNEGTaszX5UZWJek8Z4OKvvp9176eUiUu38fXs6vr4d5v0q//QTFnfEqu6VMC1xStVupPnrXBS3c1U='; // Replace with your encrypted keys
    const secret = 'your-secret-passphrase';

    const decryptedKeys = JSON.parse(CryptoJS.AES.decrypt(encryptedKeys, secret).toString(CryptoJS.enc.Utf8));

    const twitchOAuthToken = decryptedKeys.twitchOAuthToken;
    const twitchClientID = decryptedKeys.twitchClientID;
    const twitchChannelID = decryptedKeys.twitchChannelID;
    const elevenLabsAPIKey = decryptedKeys.elevenLabsAPIKey;
    const elevenLabsVoiceID = 'srUyX1KiPXUS7jvGq3HY'

    function connectTwitchPubSub() {
        const ws = new WebSocket('wss://pubsub-edge.twitch.tv');

        ws.onopen = () => {
            logToConsole('Attempting to connect to Twitch PubSub...')
            const message = {
                type: 'LISTEN',
                nonce: 'unique_nonce',
                data: {
                    topics: [`channel-bits-events-v2.${twitchChannelID}`],
                    auth_token: twitchOAuthToken
                }
            };
            ws.send(JSON.stringify(message));
            logToConsole('Connected to Twitch PubSub');
        };

        ws.onmessage = event => {
            const message = JSON.parse(event.data);
            if (message.type === 'MESSAGE') {
                const bitsMessage = JSON.parse(message.data.message);
                handleBitsEvent(bitsMessage);
            }
        };

        ws.onerror = error => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('Disconnected from Twitch PubSub');
            setTimeout(connectTwitchPubSub, 5000);
        };
    }

    function handleBitsEvent(bitsMessage) {
        const bitsUsed = bitsMessage.data.bits_used;
        let chatMessage = bitsMessage.data.chat_message;
        const sender = bitsMessage.data.user_name;
        chatMessage = chatMessage.replace(/Cheer\d+/g, '').trim();

        logToConsole(`Received ${bitsUsed} bits with message: ${chatMessage}`);

        if (sender === 'olanorw_') {
            if (bitsUsed >= 1) {
                
                if (chatMessage.includes('nigger')) {
                    // Skip the message
                    console.log("Skipping message");
                }
                if (chatMessage.includes('nigga')) {
                    // Skip the message
                    console.log("Skipping message");
                }
                else {
                sendToElevenLabs(chatMessage);
                }
            }
        }

        if (bitsUsed >= 100) {
            if (chatMessage.includes('nigger')) {
                // Skip the message
                console.log("Skipping message");
            }
            if (chatMessage.includes('nigga')) {
                // Skip the message
                console.log("Skipping message");
            }
            else {
                sendToElevenLabs(chatMessage);
            }
        }

        // The following is old code for a segment of the project that was removed
        //const bitsUsed = bitsMessage.data.bits_used;
        //const chatMessage = bitsMessage.data.chat_message;

        //if (bitsUsed >= 100) {
        //    console.log(`Received ${bitsUsed} bits with message: ${chatMessage}`);
        //    sendToElevenLabs(chatMessage);
        //}
    }

    function sendToElevenLabs(chatMessage) {
        
        const options = {
            method: 'POST',
            headers: {
                'xi-api-key': elevenLabsAPIKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: chatMessage,
                model_id: 'eleven_turbo_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 1
                }
            })
        };
        logToConsole('Attempting to send message to the ElevenLabs API...')
        fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceID}`, options)
            .then(response => response.arrayBuffer())
            .then(buffer => {
                const base64Audio = btoa(
                    new Uint8Array(buffer)
                        .reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
                const audioPlayer = document.getElementById('audioPlayer');
                audioPlayer.src = `data:audio/mp3;base64,${base64Audio}`;
                audioPlayer.volume = 0.15;
                audioPlayer.play();
                logToConsole('Audio file received from ElevenLabs API and played successfully');
            })
            .catch(err => logToConsole.error(err));
    }

    connectTwitchPubSub();
});
