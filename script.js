let stream;
let mediaRecorder;
let audioChunks = [];

const startMicrophoneButton = document.getElementById('startMicrophoneButton');
const stopMicrophoneButton = document.getElementById('stopMicrophoneButton');

startMicrophoneButton.addEventListener("click", async () => {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        const formData = new FormData();
        formData.append("file", audioBlob);
        formData.append("model", "whisper-1");

        fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                "Authorization": "Bearer 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"
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Transcription:', data);
            displayTranscription(data); // Call a function to display the transcription
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

        function displayTranscription(data) {
            const transcriptionDiv = document.getElementById('transcription');
            const originalTranscriptionText = data.text || "Transcription not available";

            // System instructions
            const systemInstructions = "Te egy JSON előállító automata vagy amely egy szabványos JSON formátumban (\"négyzetméter\":integer, \"ár\":string, \"lokáció\":string lista mezőkkel) visszaadja a szövegből \
            az ingatlanparamétereket.Ha hiányzik egy paraméter, akkor oda \"N/A\"-t alkalmazz. Ha valahol csak maximumot ad meg a user, akkor ott \"N/A - a megadott maximum érték\" \
            formában add meg a JSON mezőt. Ha valahol csak minimumot ad meg a user, akkor ott \"a megadott minimum érték - N/A\" \
            formában add meg a JSON mezőt. A válaszban csak a JSON legyen benne.";

            fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Replace YOUR_OPENAI_API_KEY with your actual OpenAI API key
                    'Authorization': 'Bearer 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'
                },
                body: JSON.stringify({
                    model: "gpt-4",
                    messages: [
                        {
                            "role": "system",
                            "content": systemInstructions
                        },
                        {
                            "role": "user",
                            "content": originalTranscriptionText
                        }
                    ]
                })
            })
            .then(response => response.json())
            .then(data => {
                // Assuming the API response structure, you might need to adjust the path to the corrected text
                const correctedTranscriptionText = data.choices[0].message.content || "Correction not available";
                transcriptionDiv.textContent = correctedTranscriptionText;
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }

    mediaRecorder.start();
    audioChunks = []; // Reset the audio chunks array for each new recording
});

stopMicrophoneButton.addEventListener("click", () => {
    if (mediaRecorder.state !== 'inactive') mediaRecorder.stop(); // Stop recording if it's active
    stream.getTracks().forEach(track => track.stop()); // Stop the media stream tracks
});
