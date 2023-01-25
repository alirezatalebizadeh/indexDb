let myForm = document.querySelector('.register-form'),
    userInput = document.querySelector('.name-input'),
    passInput = document.querySelector('.password-input'),
    emailInput = document.querySelector('.email-input'),
    userTableElem = document.querySelector('table');
userTableElem = document.querySelector('table');

let users = []
let db = null;
let objectStore = null;



window.addEventListener('load', () => {
    let DbOpenReq = indexedDB.open('book', 18)

    DbOpenReq.addEventListener('error', (err) => {
        console.log('Error', err);
    })

    DbOpenReq.addEventListener('success', (event) => {
        db = event.target.result;
        console.log('success', event.target.result);
        getUser()
    })



    DbOpenReq.addEventListener('upgradeneeded', (event) => {
        db = event.target.result;

        console.log('old Version', event.oldVersion);
        console.log('Version', event);

        if (!db.objectStoreNames.contains('users')) {
            objectStore = db.createObjectStore('users', {
                keyPath: 'userID'
            })
        }

        console.log('objectStoreName', db.objectStoreNames);
    })
})

myForm.addEventListener('submit', event => {
    event.preventDefault();

    let newUser = {
        userID: Math.floor(Math.random() * 100),
        name: userInput.value,
        password: passInput.value,
        email: emailInput.value
    }

    let tx = createTx('users', 'readwrite');
    tx.addEventListener('success', event => console.log('success', event))

    let store = tx.objectStore('users')
    let request = store.add(newUser)

    request.addEventListener('error', err => console.log('error Request', err))
    request.addEventListener('success', event => console.log('success Request', event))
    clearInput()
    getUser()
    // console.log(newUser);
})


function clearInput() {
    userInput.value = ''
    passInput.value = ''
    emailInput.value = ''
}

function getUser() {
    let tx = createTx('users', 'readonly');

    tx.addEventListener('complete', event => {
        console.log('tx complete', event);
    })

    let store = tx.objectStore('users');
    let request = store.getAll();

    request.addEventListener('error', err => {
        console.warn('error abour request', err)
    })

    request.addEventListener('success', event => {
        let allUsers = event.target.result
        userTableElem.innerHTML = '';
        userTableElem.innerHTML = `<tr>
        <th>ID</th>
        <th>Name</th>
        <th>Password</th>
        <th>Email</th>
        <th>Action</th>
        </tr>`;
        userTableElem.innerHTML += allUsers.map(user => {
            return `<tr>
                                        <td>${user.userID}</td>
                                        <td>${user.name}</td>
                                        <td>${user.password}</td>
                                        <td>${user.email}</td>
                                        <td><a href="#" onclick="removeUser(${user.userID})">Remove</a></td>
                                    </tr>`
        }).join('')

    })

}

function removeUser(userId) {
    // event.preventDefault()
    
    let tx = createTx('users', 'readwrite')
    
    tx.addEventListener('complete', (event) => {
        console.log('Delete Tx', event);
    })
    // console.log(tx);

    let store=tx.objectStore('users');
    let request=store.delete(userId);

    request.addEventListener('error',(err)=>{
        console.warn('request Error' , err)
    })
    request.addEventListener('success',(event)=>{
        console.log('request success delete user' , event)
        getUser()
    })

}





function createTx(storeName, mode) {
    let tx = db.transaction(storeName, mode);

    tx.addEventListener('error', (err) => {
        console.warn('tx error', err)
    })

    return tx
}