const friendReqButton = document.getElementById('friendReqButton');
const createGroupButton = document.getElementById('createGroupButton');

const groupNameButton = document.getElementById('groupNameButton');
const friendIdButton = document.getElementById('friendIdButton');
const friendForm = document.getElementById('friendForm');
const groupForm = document.getElementById('groupForm');

// Event listener for the createGroupButton
createGroupButton.addEventListener('click', (event) => {
    // If the group name form and button are hidden, display them
    if (groupForm.style.display == 'none' || groupNameButton.style.display == 'none') {
        // If the friendReqButton is active, remove its form and submit button
        if (friendForm.style.display == '' || friendIdButton.style.display == '') {
            friendForm.style.display = 'none';
            friendIdButton.style.display = 'none';
        }

        groupForm.style.display = '';
        groupNameButton.style.display = '';
    }

    // If the user clicks the createGroupButton and its form and submit button are visible, hide them
    else {
        groupForm.style.display = 'none';
        groupNameButton.style.display = 'none';
    }
});

// Event listener for the friendReqButton
friendReqButton.addEventListener('click', (event) => {
    // If the friend id form and submit button are hidden, display them
    if (friendForm.style.display == 'none' || friendIdButton.style.display == 'none') {
        // If the createGroupButton is active, remove its form and submit button
        if (groupForm.style.display == '' || groupNameButton.style.display == '') {
            groupForm.style.display = 'none';
            groupNameButton.style.display = 'none';
        }

        friendForm.style.display = '';
        friendIdButton.style.display = '';
    }
    
    // If the user clicks the friendReqButton and its form and submit button are visible, hide them
    else {
        friendForm.style.display = 'none';
        friendIdButton.style.display = 'none';
    }
});