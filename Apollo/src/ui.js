const friendReqButton = document.getElementById('friendReqButton');
const createGroupButton = document.getElementById('createGroupButton');

const groupNameButton = document.getElementById('groupNameButton');
const friendIdButton = document.getElementById('friendIdButton');
const friendForm = document.getElementById('friendForm');
const groupForm = document.getElementById('groupForm');


createGroupButton.addEventListener('click', (event) => {
    groupNameButton.removeAttribute('hidden');
    groupForm.removeAttribute('hidden');
});

friendReqButton.addEventListener('click', (event) => {
    friendIdButton.removeAttribute('hidden');
    friendForm.removeAttribute('hidden');
});