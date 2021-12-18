class Participant {

    constructor(id, name, friend, isSelected) {
        this.id = id;
        this.name = name;
        this.friend = friend;  // != "" => participant already has a friend
        this.isSelected = isSelected; // true if this participant was selected by another one
    }

}