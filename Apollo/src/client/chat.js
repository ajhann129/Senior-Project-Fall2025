const usrMsg = document.getElementById('usrMsg');
const sendMsg = document.getElementById('sendMsg');

//Event listener for send button
sendMsg.addEventListener('click', (event) => {
    event.preventDefault();

    message = document.createElement('p');
    message.setAttribute('class', 'displayedMsg');
    message.innerHTML = usrMsg.value;
    usrMsg.before(message);

    usrMsg.value = '';
})

//Event listener to send message with the Enter key
usrMsg.addEventListener('keydown', (event) => {
    
    if (event.key == 'Enter') {
        message = document.createElement('p');
        message.setAttribute('class', 'displayedMsg');
        message.innerHTML = usrMsg.value;
        usrMsg.before(message);

        usrMsg.value = '';
    }
    
})