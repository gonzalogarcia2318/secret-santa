window.onload = function () {
    participantsSelect = document.getElementById("participantsSelect");
    participantsSelect.disabled = true;

    const urlParams = new URLSearchParams(window.location.search);
    const eventName = urlParams.get('evento');
    if (eventName) {
        startDatabaseConnection(getDatabaseNameByEvent(eventName));
    }
    //
    // fillResultsList();
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
            const possibleFriends = participants.filter(p => participant.id != p.id && !p.isSelected);
            //
            const randomIndex = Math.floor(Math.random() * possibleFriends.length);
            invisibleFriend = possibleFriends[randomIndex];

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
