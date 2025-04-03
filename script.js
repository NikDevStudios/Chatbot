const chatMessages = document.getElementById('chat-messages');
const inputArea = document.getElementById('input-area');
let currentState = 'start';
let answers = { department: '', name: '', urgency: '', description: '', canFix: '' };
let restartTimer;

function appendMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showButtons(options, callback) {
    inputArea.innerHTML = '';
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => {
            appendMessage(option, 'user');
            callback(option);
        };
        inputArea.appendChild(button);
    });
}

function showTextInput(callback) {
    inputArea.innerHTML = '';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type your answer...';
    const sendButton = document.createElement('button');
    sendButton.textContent = 'Send';
    sendButton.classList.add('send-button');
    inputArea.appendChild(input);
    inputArea.appendChild(sendButton);

    const submit = () => {
        const text = input.value.trim();
        if (text) {
            appendMessage(text, 'user');
            callback(text);
        }
    };
    sendButton.onclick = submit;
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submit();
    });
    input.focus();
}

function generateSummary() {
    return `Department: ${answers.department}\nName: ${answers.name}\nUrgency: ${answers.urgency}\nDescription: ${answers.description}\nCan Fix: ${answers.canFix}`;
}

function showSummaryAndSendOptions() {
    const summary = generateSummary();
    appendMessage(`Your submission:\n${summary}\n\nChoose an option below to send the data.`, 'bot');
    inputArea.innerHTML = '';

    // Send via email button
    const emailButton = document.createElement('button');
    emailButton.textContent = 'Send via email';
    emailButton.onclick = () => {
        const mailtoUrl = `mailto:webdevelopmentcollective@outlook.com?subject=Chatbot%20Submission&body=${encodeURIComponent(summary)}`;
        window.location.href = mailtoUrl;
    };
    inputArea.appendChild(emailButton);

    // Copy to clipboard button
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy to clipboard';
    copyButton.onclick = () => {
        navigator.clipboard.writeText(summary).then(() => {
            alert('Data copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };
    inputArea.appendChild(copyButton);

    // Restart chat button
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Restart Chat';
    restartButton.onclick = () => {
        clearTimeout(restartTimer);
        startChat();
    };
    inputArea.appendChild(restartButton);

    // Auto-restart after 15 seconds
    restartTimer = setTimeout(startChat, 15000);
}

function startChat() {
    currentState = 'start';
    answers = { department: '', name: '', urgency: '', description: '', canFix: '' };
    chatMessages.innerHTML = '';
    inputArea.innerHTML = '';
    appendMessage('Hello! Which department are you from?', 'bot');
    showButtons(['IT Team', 'Sales Team'], handleDepartment);
}

function handleDepartment(department) {
    answers.department = department;
    currentState = 'ask_name';
    appendMessage('Who am I speaking with?', 'bot');
    showTextInput(handleName);
}

function handleName(name) {
    answers.name = name;
    currentState = 'ask_urgency';
    appendMessage('Is it urgent?', 'bot');
    showButtons(['Yes', 'No'], handleUrgency);
}

function handleUrgency(urgency) {
    answers.urgency = urgency;
    if (urgency === 'No') {
        currentState = 'ask_description_not_urgent';
        appendMessage('What is it about?', 'bot');
        showTextInput(handleDescriptionNotUrgent);
    } else {
        currentState = 'ask_description_urgent';
        appendMessage('What is it about?', 'bot');
        showTextInput(handleDescriptionUrgent);
    }
}

function handleDescriptionNotUrgent(description) {
    answers.description = description;
    currentState = 'ask_can_fix_not_urgent';
    appendMessage('Can you fix it yourself?', 'bot');
    showButtons(['Yes', 'No'], handleCanFixNotUrgent);
}

function handleCanFixNotUrgent(canFix) {
    answers.canFix = canFix;
    currentState = 'end_not_urgent';
    appendMessage('Please bring it up during Sunday\'s weekly meeting.', 'bot');
    setTimeout(() => {
        appendMessage('Thank you for letting me know!', 'bot');
        showSummaryAndSendOptions();
    }, 2000);
}

function handleDescriptionUrgent(description) {
    answers.description = description;
    currentState = 'ask_can_fix_urgent';
    appendMessage('Can you fix it yourself?', 'bot');
    showButtons(['Yes', 'No'], handleCanFixUrgent);
}

function handleCanFixUrgent(canFix) {
    answers.canFix = canFix;
    if (canFix === 'Yes') {
        currentState = 'end_urgent_can_fix';
        appendMessage('I\'ve given you permission to handle it!', 'bot');
    } else {
        currentState = 'end_urgent_cannot_fix';
        appendMessage('I\'ll contact you tomorrow about this!', 'bot');
    }
    setTimeout(() => {
        appendMessage('Thank you for letting me know!', 'bot');
        showSummaryAndSendOptions();
    }, 2000);
}

startChat();