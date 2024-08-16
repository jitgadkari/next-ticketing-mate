import PocketBase from 'pocketbase';
import Cookies from 'js-cookie';

const pb = new PocketBase('https://irony-name.pockethost.io');

// Load auth data from cookies on startup
pb.authStore.loadFromCookie(Cookies.get('pb_auth') || '');

// Set up a listener to store auth data in cookies whenever it changes
pb.authStore.onChange(() => {
  Cookies.set('pb_auth', pb.authStore.exportToCookie(), { expires: 7 });
});

export default pb;
