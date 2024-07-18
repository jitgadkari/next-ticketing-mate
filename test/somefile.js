import PocketBase from 'pocketbase';

const pb = new PocketBase('https://completely-area.pockethost.io');


const authData = await pb.collection('users').authWithPassword(
    'manishb27',
    'QAZ@1234',
);

// after the above you can also access the auth data from the authStore
console.log(pb.authStore.isValid);
console.log(pb.authStore.token);
console.log(pb.authStore.model.id);

// "logout" the last a