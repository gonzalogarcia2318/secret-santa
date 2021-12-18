window.onload = function () {
    participantsSelect = document.getElementById("participantsSelect");
    participantsSelect.disabled = true;

    const urlParams = new URLSearchParams(window.location.search);
    const eventName = urlParams.get('evento');
    document.getElementById('eventName').innerHTML = eventName.toLowerCase();

    startDatabaseConnection(getDatabaseNameByEvent(eventName));
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

    database.on('value', function (snapshot) {
        console.warn("Database was updated. Refresh data.")
        parseData(snapshot.val());
    });
}

function parseJsonToList(json) {
    let list = [];
    for (key in json) {
        let participant = new Participant(key, json[key].name, json[key].friend, json[key].isSelected);
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
        if (participant.friend == "" || participant.friend == null) {
            let option = document.createElement('option');
            option.text = participant.name;
            option.value = participant.id;
            participantsSelect.add(option);
        }
    })

    participantsSelect.disabled = false;
}

function getInvisibleFriend() {
    if (participantsSelect.value != null && participantsSelect.value != "") {
        let participant = participants.find(p => p.id == participantsSelect.value);
        let invisibleFriend;
        //
        if (participant != null) {
            //
            console.log("Getting invisible friend for: ", participant);
            //
            let possibleFriends = participants.filter(p => participant.id != p.id && !p.isSelected);
            //
            let randomIndex = Math.floor(Math.random() * possibleFriends.length);
            invisibleFriend = possibleFriends[randomIndex];
            //
            invisibleFriend.isSelected = true;
            participant.friend = invisibleFriend.name;
            //
            resultLabelText = document.getElementById("resultLabelText");
            resultLabelText.innerHTML = `Tu amigo invisible es: ${invisibleFriend.name.toUpperCase()}`
            //
            document.getElementById('resultLabel').classList.add('fade-in--show');
            document.getElementById('resultLabel').classList.remove('fade-in--hide');
            //
            document.getElementById("pickerContainer").classList.add('fade-out--hide');
            document.getElementById("pickerContainer").classList.add('fade-out--show');
            document.getElementById("pickerContainer").style.pointerEvents = 'none';
        }
        //
        update(participant, invisibleFriend);
    }
}

// Remove all data and then generate test objects.
function generateData() {
    database.remove();

    // Nombres de los participantes
    const names = ["Daniel", "Susana", "Mariana", "Agustina", "Gonzalo"];

    names.forEach(name => {
        let participant = new Participant(null, name, "", false);
        save(participant);
    })
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
function update(participant, friend) {
    let updates = {};
    updates[participant.id] = participant;
    updates[friend.id] = friend;
    //
    return database.update(updates);
}


function getDatabaseNameByEvent(event) {
    // event: NOCHEBUENA | NAVIDAD
    return event == 'NOCHEBUENA' ? 'nochebuenaDb' : 'navidadDb';
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