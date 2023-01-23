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
    getUser()
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
        </tr>`;
        userTableElem.innerHTML += allUsers.map(user => {
            return `<tr>
                                        <td>${user.userID}</td>
                                        <td>${user.name}</td>
                                        <td>${user.password}</td>
                                        <td>${user.email}</td>
                                    </tr>`
        }).join('')

    })

}







function createTx(storeName, mode) {
    let tx = db.transaction(storeName, mode);

    tx.addEventListener('error', (err) => {
        console.warn('tx error', err)
    })

    return tx
}