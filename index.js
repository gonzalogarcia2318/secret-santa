window.onload = function () {
    participantsSelect = document.getElementById("participantsSelect");
    participantsSelect.disabled = true;

    const urlParams = new URLSearchParams(window.location.search);
    const eventName = urlParams.get('evento');
    if (eventName) {
        startDatabaseConnection(getDatabaseNameByEvent(eventName));
        refreshParticipants(null);
    }
    //
    fillResultsList();
}

let participants = [];
let database;

let participantToUpdate;

let participantsSelect;
let resultLabel;

function startDatabaseConnection(dbName) {
    console.log('Using database: ' + dbName);
    firebase.initializeApp(firebaseConfig);

    database = firebase.database().ref(dbName);

    // Subscribe to db changes. No need if we are only showing the pre-calculated results.
    // database.on('value', function (snapshot) {
    //     console.warn("Database was updated. Refresh data.")
    //     parseData(snapshot.val());
    // });
}

function parseJsonToList(json) {
    let list = [];
    for (key in json) {
        let participant = new Participant(key, json[key].name, json[key].friend, json[key].isSelected, json[key].friendViewed);
        list.push(participant);
    }
    return list;
}

function parseData(json) {
    participants = parseJsonToList(json);

    console.log("Participants", participants);

    // Fill select with participants that didn't chose yet
    participantsSelect = document.getElementById("participantsSelect");
    participantsSelect.options.length = 0;
    let option = document.createElement('option');
    option.text = "";
    participantsSelect.add(option);

    participants.forEach(participant => {
        if (!participant.friendViewed) {
            const option = document.createElement('option');
            option.text = participant.name;
            option.value = participant.id;
            participantsSelect.add(option);
        }
    })

    participantsSelect.disabled = false;
}

function getInvisibleFriend(participant) {
    let invisibleFriend;
    //
    if (participant != null) {
        const possibleFriends = participants.filter(p => participant.id != p.id && !p.isSelected);
        //
        const randomIndex = Math.floor(Math.random() * possibleFriends.length);
        invisibleFriend = possibleFriends[randomIndex];
        //
        // Validation for the last participant
        // The last participant could get himself as friend, so we have to check in the previous one. 
        if (possibleFriends.length == 2) {
            invisibleFriend.isSelected = true;
            possibleFriends.splice(possibleFriends.indexOf(invisibleFriend), 1);

            const remainingParticipant = possibleFriends[0];

            if (!remainingParticipant.friend) {
                const possibleFriendsForLastOne = participants.filter(p => remainingParticipant.id != p.id && !p.isSelected);

                if (possibleFriendsForLastOne.length == 0) {
                    // Last partipant would get himselft as friend, so we have to switch them.
                    invisibleFriend.isSelected = false;
                    invisibleFriend = remainingParticipant;
                }
            }

        }
        //
        invisibleFriend.isSelected = true;
        participant.friend = invisibleFriend.name;
    }
    //
    updateParticipants([participant, invisibleFriend]);
}

function showInvisibleFriend() {
    if (participantsSelect.value != null && participantsSelect.value != "") {
        const participant = participants.find(p => p.id == participantsSelect.value);
        resultLabelText = document.getElementById("resultLabelText");
        resultLabelText.innerHTML = `Tu amigo invisible es: ${participant.friend.toUpperCase()}`
        //
        document.getElementById('resultLabel').classList.add('fade-in--show');
        document.getElementById('resultLabel').classList.remove('fade-in--hide');
        //
        document.getElementById("pickerContainer").classList.add('fade-out--hide');
        document.getElementById("pickerContainer").classList.add('fade-out--show');
        document.getElementById("pickerContainer").style.pointerEvents = 'none';
        //
        participant.friendViewed = true;
        updateParticipant(participant);
    }
}


function save(participant) {
    database.push().set(participant)
        .then(function (snapshot) {
            console.log(`${participant.name} saved successfully`);
        }, function (error) {
            console.log(`ERROR on saving ${participant.name}`);
        });
}

// Update both participant and it's friend in the database with one call.
function updateParticipants(participants) {
    let updates = {};
    participants.forEach(p => updates[p.id] = p);
    return database.update(updates);
}

function updateParticipant(participant) {
    let updates = {};
    updates[participant.id] = participant;
    return database.update(updates);
}


function getDatabaseNameByEvent(event) {
    // event: NOCHEBUENA | NAVIDAD
    return event == 'NOCHEBUENA' ? 'nochebuenaDb' : 'navidadDb';
}


function generateParticipants() {
    database.remove();

    // Nombres de los participantes
    const names = ["Daniel", "Susana", "Mariana", "Agustina", "Gonzalo"];

    names.forEach(name => {
        let participant = new Participant(null, name, "", false, false);
        save(participant);
    })
}


function assignInvisibleFriends() {
    refreshParticipants(() => {
        participants.forEach(participant => {
            if (participant.friend == '' || participant.friend == null) {
                getInvisibleFriend(participant);
            }
        })
    });
}

function generateAndAssignParticipants() {
    generateParticipants();
    assignInvisibleFriends();
}

function refreshParticipants(callback) {
    database.once('value', function (snapshot) {
        parseData(snapshot.val());
        if (callback != null) {
            callback();
        }
    });
}

// Functions to help in the development. Will be removed 
// 
//
function showActions() {
    let containerDisplay = getComputedStyle(document.getElementById("dataContainer")).display;
    document.getElementById("dataContainer").style.display = containerDisplay == 'none' || containerDisplay == "" ? 'flex' : 'none';
}

function toggleElement(elementId) {
    document.getElementById(elementId).style.opacity = document.getElementById(elementId).style.opacity == "" || document.getElementById(elementId).style.opacity == 1 ? 0 : 1;
}

function fillResultsList() {
    database.once('value', function (snapshot) {
        fillTable("resultsDataTable", snapshot.val());
    });
}

function fillList(listId, json) {
    let items = parseJsonToList(json);
    //
    let list = document.getElementById(listId);
    list.innerHTML = "";

    items.forEach(item => {
        let listItem = document.createElement('li');
        listItem.innerHTML = `${item.name} - Friend: ${item.friend} - Selected: ${item.isSelected}`;
        list.appendChild(listItem);
    })
}

function fillTable(tableId, json) {
    const items = parseJsonToList(json);
    //
    const table = document.getElementById(tableId);
    //
    items.forEach(item => {
        let row = table.insertRow();
        let nameColumn = row.insertCell(0);
        nameColumn.innerHTML = item.name;
        let friendColumn = row.insertCell(1);
        friendColumn.innerHTML = item.friend;
        //
        if (item.friend != null && item.friend != "" && item.isSelected) {
            row.classList.add('completed');
        } else if (item.friend != null && item.friend != "" && !item.isSelected) {
            row.classList.add('selected');
        } else if (item.isSelected) {
            row.classList.add('chosen');
        }
    });
}