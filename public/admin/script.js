document.addEventListener('DOMContentLoaded', () => {
	const messageInput = document.getElementById('message-input');
	const sendButton = document.getElementById('send-button');
	const chatMessages = document.getElementById('chat-messages');
	const clearButton = document.getElementById('clear-button');

	function getMessages() {
		return JSON.parse(localStorage.getItem('messages')) || [];
	}

	function setMessages(messages) {
		localStorage.setItem('messages', JSON.stringify(messages));
		return true;
	}

	const messages = getMessages();
	// Load messages from LocalStorage
	messages.forEach(appendUiMessage);

	sendButton.addEventListener('click', sendMessage);
	messageInput.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') {
			sendMessage();
		}
	});

	clearButton.addEventListener('click', clearMessages);

	async function sendMessage() {
		const messageText = messageInput.value.trim();
		if (messageText) {
			const message = {
				role: 'user',
				content: messageText,
			};
			const messages = getMessages();
			messages.push(message);
			setMessages(messages);
			appendUiMessage(message);
			messageInput.value = '';

			// Send message to server
			const response = await fetch('/admin/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ messages }),
			});
			const assistantMsg = { role: 'assistant', content: '' };
			// Create the placeholder to stream into
			const assistantResponse = appendUiMessage(assistantMsg);
			const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
			while (true) {
				const { value, done } = await reader.read();
				if (done) {
					console.log('Stream done');
					// Add to the messages
					messages.push(assistantMsg);
					// And store them for later
					setMessages(messages);
					break;
				}
				assistantMsg.content += value;
				// Do not wipe out the model display
				assistantResponse.innerHTML = assistantMsg.content;
			}
		}
	}

	function appendUiMessage(message) {
		const messageElement = document.createElement('div');
		messageElement.classList.add('message');
		if (message.role === 'user') {
			messageElement.classList.add('user');
		} else if (message.role === 'assistant') {
			messageElement.classList.add('assistant');
		}
		messageElement.textContent = message.content;
		chatMessages.appendChild(messageElement);
		chatMessages.scrollTop = chatMessages.scrollHeight;
		return messageElement;
	}

	function clearMessages() {
		localStorage.removeItem('messages');
		chatMessages.innerHTML = '';
	}
});
