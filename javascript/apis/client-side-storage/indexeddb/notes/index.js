// Create needed constants
const list = document.querySelector('ul');
const titleInput = document.querySelector('#title');
const bodyInput = document.querySelector('#body');
const form = document.querySelector('form');
const submitBtn = document.querySelector('form button');

// Create an instance of a db object to store the open database in
let db;

window.onload = function () {
    // Open our database; it is created if it doesn't already exist (see onupgradeneeded below)
    let request = window.indexedDB.open('notes_db', 1);

    // onerror handler signifies that the db falied to open
    request.onerror = function () {
        console.log('Database failed to open');
    };

    // onsuccess handler signifies the db opened succesfully
    request.onsuccess = function () {
        console.log('Database opened succesfully');

        // Store the opened database object in the db variable. This is used a lot below
        db = request.result;

        // run displayData() to display notes already in the database
        displayData();
    };

    // Setup the database tables if this has not already been done
    request.onupgradeneeded = function (e) {
        // Grab a reference to the opened database
        let db = e.target.result;

        // Create an objectStore to store our notes in (basically like a single table) including an auto-incrementing key
        let objectStore = db.createObjectStore('notes_os', { keyPath: 'id', autoIncrement: true });

        // Define what data items the objectStore will contain
        objectStore.createIndex('title', 'title', { unique: false });
        objectStore.createIndex('body', 'body', { unique: false });

        console.log('Database setup complete');
    };

    // Create onsubmit handler, when form is submitted, addData() is run
    form.onsubmit = addData;

    // Define the addData() function
    function addData(e) {
        // prevent default behaviour, we don't want the form to submit the conventional way
        e.preventDefault();

        // grab the values entered into the form fields and store them in an object ready for being inserted into the DB
        let newItem = { title: titleInput.value, body: bodyInput.value };

        // open read/write db transaction, ready for adding the data
        let transaction = db.transaction(['notes_os'], 'readwrite');

        // call an object store that's already been added to the database
        let objectStore = transaction.objectStore('notes_os');

        // make a request to add our newItem object to the object store
        let request = objectStore.add(newItem);
        request.onsuccess = function () {
            // clear the form ready for adding the next entry
            titleInput.value = '';
            bodyInput.value = '';
        };

        // Report on the success of the transaction completing, when everything is done
        transaction.oncomplete = function () {
            console.log('Transaction completed: database modification finished.');

            // update the display of data to show the newly added item, by running displayData() again.
            displayData();
        };

        transaction.onerror = function () {
            console.log('Transaction not opened due to error');
        };
    }

    function displayData() {
        // Here we empty the contents of the list element each time the display is updated. If you didn't do this, you'd get duplicates listed each time a new note is added
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }

        // Open object store and get a cursor - which iterates through all the different data items in the store
        let objectStore = db.transaction('notes_os').objectStore('notes_os');
        objectStore.openCursor().onsuccess = function(e){
            // get a reference to the cursor
            let cursor = e.target.result;

            // if there is still another data item to iterate through, keep running this code
            if(cursor) {
                // create list item, h3 and p to put each data item inside when displaying it
                // structure the HTML fragment and append inside the list
                const listItem = document.createElement('li');
                const h3 = document.createElement('h3');
                const para = document.createElement('p');
                listItem.appendChild(h3);
                listItem.appendChild(para);
                list.appendChild(listItem);

                // put the data from the cursor inside the h3 and paragraph
                h3.textContent = cursor.value.title;
                para.textContent = cursor.value.body;

                // Store the ID of the data item inside an attribute on the listItem, so we know which item it corresponds to. 
                // This will be useful later when we want to delete items
                listItem.setAttribute('data-note-id', cursor.value.id);

                // create a delete button inside listItem
                const deleteBtn = document.createElement('button');
                listItem.appendChild(deleteBtn);
                deleteBtn.textContent = 'Delete';
                // and set event handler for button
                deleteBtn.onclick = deleteItem;

                // iterate to the next item in cursor
                cursor.continue();
            } else {
                // list item is empty, display a message
                if(!list.firstChild) {
                    const listItem = document.createElement('li');
                    listItem.textContent = 'No notes stored.';
                    list.appendChild(listItem);
                }
                // if there are no more cursor items to iterate through print to log
                console.log('All notes displayed');
            }
        };
    }

    function deleteItem(e) {
        // retrieve the name of the task to delete
        // IDB key values are type sensitive, so we need to convert li item attribute (string) to number
        let noteId = Number(e.target.parentNode.getAttribute('data-note-id'));

        // open a database transaction and delete note, finding it using id retrieved above
        let transaction = db.transaction(['notes_os'], 'readwrite');
        let objectStore = transaction.objectStore('notes_os');
        let request = objectStore.delete(noteId);

        // report item deletion and update view if all notes are deleted
        transaction.oncomplete = function() {
            // delete parent of the button clicked
            e.target.parentNode.parentNode.removeChild(e.target.parentNode);
            console.log('Note ' + noteId + ' deleted.');

            // again if list item is empty, display a message
            if(!list.firstChild) {
                let listItem = document.createElement('li');
                listItem.textContent = 'No notes stored.';
                list.appendChild(listItem);
            }
        };
    }
};