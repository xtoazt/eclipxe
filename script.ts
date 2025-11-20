import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, get, remove, update, Database } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDl-bNaeBYGKbkBGrpEfd7sSDu-Aoa5BRg",
  authDomain: "loll-657f3.firebaseapp.com",
  databaseURL: "https://loll-657f3-default-rtdb.firebaseio.com",
  projectId: "loll-657f3",
  storageBucket: "loll-657f3.appspot.com",
  messagingSenderId: "1028823108280",
  appId: "1:1028823108280:web:9b3421a1d777425dacc24d",
  measurementId: "G-4FJLHJ6THR"
};

const app = initializeApp(firebaseConfig);
const db: Database = getDatabase(app);

interface User {
  username: string;
  isAdmin?: boolean;
  displayName?: string;
  displayNameColor?: string;
  fingerprintId?: string;
  ipAddress?: string;
}

interface Message {
  username: string;
  displayName?: string;
  displayNameColor?: string;
  isAdmin?: boolean;
  text: string;
  mentions?: string[];
  timestamp: number;
}

interface ColorCode {
  color: string;
  expiresAt: number;
  generatedBy: string;
}

interface CodeRequest {
  username: string;
  timestamp: number;
}

// Initialize FingerprintJS
let fingerprintId: string | null = null;
if (typeof (window as any).FingerprintJS !== 'undefined') {
  (window as any).FingerprintJS.load({ apiKey: 'gZRHetiksU9DkAqTJCCN' }).then((fp: any) => {
    fp.get().then((result: any) => {
      fingerprintId = result.visitorId;
      console.log('Fingerprint ID:', fingerprintId);
    });
  });
}

// Get IP Address
async function getIPAddress(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
    return 'unknown';
  }
}

// Notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

let currentDmUser: string | null = null;
let notificationCheckInterval: number | null = null;
let currentUser: User | null = null;

function showToast(message: string): void {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 500);
  }, 3000);
}

function sendNotification(title: string, body: string): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: 'favicon.png' });
  }
}

async function checkBanned(): Promise<void> {
  if (!currentUser || !fingerprintId) return;

  try {
    const userBanRef = ref(db, `banned/users/${currentUser.username}`);
    const userSnapshot = await get(userBanRef);
    if (userSnapshot.exists()) {
      showToast('You have been banned.');
      localStorage.removeItem('user');
      window.location.reload();
      return;
    }

    const fingerprintBanRef = ref(db, `banned/fingerprints/${fingerprintId}`);
    const fingerprintSnapshot = await get(fingerprintBanRef);
    if (fingerprintSnapshot.exists()) {
      showToast('This device has been banned.');
      localStorage.removeItem('user');
      window.location.reload();
    }
  } catch (error) {
    console.error('Error checking ban status:', error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Get IP address
  const ipAddress = await getIPAddress();
  
  // DOM Elements
  const signupDiv = document.getElementById('signup') as HTMLElement;
  const loginDiv = document.getElementById('login') as HTMLElement;
  const chatDiv = document.getElementById('chat') as HTMLElement;
  const signupUsername = document.getElementById('signupUsername') as HTMLInputElement;
  const signupPassword = document.getElementById('signupPassword') as HTMLInputElement;
  const signupAdminCode = document.getElementById('signupAdminCode') as HTMLInputElement;
  const toggleSignupPassword = document.getElementById('toggleSignupPassword') as HTMLElement;
  const signupBtn = document.getElementById('signupBtn') as HTMLButtonElement;
  const loginUsername = document.getElementById('loginUsername') as HTMLInputElement;
  const loginPassword = document.getElementById('loginPassword') as HTMLInputElement;
  const toggleLoginPassword = document.getElementById('toggleLoginPassword') as HTMLElement;
  const loginBtn = document.getElementById('loginBtn') as HTMLButtonElement;
  const logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement;
  const displayName = document.getElementById('displayName') as HTMLElement;
  const menuDisplayName = document.getElementById('menuDisplayName') as HTMLElement;
  const messageInput = document.getElementById('messageInput') as HTMLInputElement;
  const sendBtn = document.getElementById('sendBtn') as HTMLButtonElement;
  const messagesDiv = document.getElementById('messages') as HTMLElement;
  const toSignup = document.getElementById('toSignup') as HTMLElement;
  const toLogin = document.getElementById('toLogin') as HTMLElement;
  const deleteAccountBtn = document.getElementById('deleteAccountBtn') as HTMLButtonElement;
  const deleteAccountBtnDropdown = document.getElementById('deleteAccountBtnDropdown') as HTMLButtonElement;
  const menuDiv = document.getElementById('menu') as HTMLElement;
  const createPartyDiv = document.getElementById('createParty') as HTMLElement;
  const joinPartyDiv = document.getElementById('joinParty') as HTMLElement;
  const globalChatBtn = document.getElementById('globalChatBtn') as HTMLButtonElement;
  const createPartyBtn = document.getElementById('createPartyBtn') as HTMLButtonElement;
  const joinPartyBtn = document.getElementById('joinPartyBtn') as HTMLButtonElement;
  const backToMenuFromCreate = document.getElementById('backToMenuFromCreate') as HTMLButtonElement;
  const backToMenuFromJoin = document.getElementById('backToMenuFromJoin') as HTMLButtonElement;
  const partyCodeSpan = document.getElementById('partyCode') as HTMLElement;
  const joinPartyCodeInput = document.getElementById('joinPartyCode') as HTMLInputElement;
  const leavePartyBtn = document.getElementById('leavePartyBtn') as HTMLButtonElement;
  const partyCodeDisplay = document.getElementById('partyCodeDisplay') as HTMLElement;
  const deletePartyBtn = document.getElementById('deletePartyBtn') as HTMLButtonElement;
  const friendsBtn = document.getElementById('friendsBtn') as HTMLButtonElement;
  const dmsBtn = document.getElementById('dmsBtn') as HTMLButtonElement;
  const profileBtn = document.getElementById('profileBtn') as HTMLButtonElement;
  const adminPanelBtn = document.getElementById('adminPanelBtn') as HTMLButtonElement;
  const mentionAutocomplete = document.getElementById('mentionAutocomplete') as HTMLElement;
  const profileModal = document.getElementById('profileModal') as HTMLElement;
  const profileUsername = document.getElementById('profileUsername') as HTMLElement;
  const profileAccountType = document.getElementById('profileAccountType') as HTMLElement;
  const newDisplayNameInput = document.getElementById('newDisplayNameInput') as HTMLInputElement;
  const saveDisplayNameBtn = document.getElementById('saveDisplayNameBtn') as HTMLButtonElement;
  const colorCodeInput = document.getElementById('colorCodeInput') as HTMLInputElement;
  const saveColorBtn = document.getElementById('saveColorBtn') as HTMLButtonElement;
  const requestColorCodeBtn = document.getElementById('requestColorCodeBtn') as HTMLButtonElement;
  const friendsList = document.getElementById('friendsList') as HTMLElement;
  const partyMembersList = document.getElementById('partyMembersList') as HTMLElement;
  const friendSearchInput = document.getElementById('friendSearchInput') as HTMLInputElement;
  const dmUsersList = document.getElementById('dmUsersList') as HTMLElement;
  const dmMessages = document.getElementById('dmMessages') as HTMLElement;
  const dmInput = document.getElementById('dmInput') as HTMLInputElement;
  const sendDmBtn = document.getElementById('sendDmBtn') as HTMLButtonElement;
  const generateCodeBtn = document.getElementById('generateCodeBtn') as HTMLButtonElement;
  const codeExpiryHours = document.getElementById('codeExpiryHours') as HTMLInputElement;
  const generatedCodeDisplay = document.getElementById('generatedCodeDisplay') as HTMLElement;
  const banUsernameInput = document.getElementById('banUsernameInput') as HTMLInputElement;
  const banUserBtn = document.getElementById('banUserBtn') as HTMLButtonElement;
  const banFingerprintInput = document.getElementById('banFingerprintInput') as HTMLInputElement;
  const banFingerprintBtn = document.getElementById('banFingerprintBtn') as HTMLButtonElement;
  const codeRequestsList = document.getElementById('codeRequestsList') as HTMLElement;
  const savedPartiesList = document.getElementById('savedPartiesList') as HTMLElement;
  const usersList = document.getElementById('usersList') as HTMLElement;

  let mentionUsers: Array<{username: string; displayName: string; isAdmin: boolean}> = [];
  let mentionIndex = -1;
  let currentMentionQuery = '';

  // Password visibility toggle
  const togglePasswordVisibility = (input: HTMLInputElement, toggleBtn: HTMLElement): void => {
    toggleBtn.addEventListener('click', () => {
      if (input.type === 'password') {
        input.type = 'text';
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
      } else {
        input.type = 'password';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
      }
    });
  };

  togglePasswordVisibility(signupPassword, toggleSignupPassword);
  togglePasswordVisibility(loginPassword, toggleLoginPassword);

  toSignup.addEventListener('click', () => {
    loginDiv.style.display = 'none';
    signupDiv.style.display = 'block';
  });

  toLogin.addEventListener('click', () => {
    signupDiv.style.display = 'none';
    loginDiv.style.display = 'block';
  });

  // Signup
  signupBtn.addEventListener('click', async () => {
    const username = signupUsername.value.trim();
    const password = signupPassword.value;
    const adminCode = signupAdminCode.value.trim();
    const isAdmin = adminCode === '123asd';

    if (username && password) {
      try {
        const userRef = ref(db, `users/${username}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          showToast('An account with this username already exists.');
        } else {
          const userIP = await getIPAddress();
          const userData = {
            password,
            isAdmin: isAdmin || false,
            displayName: username,
            displayNameColor: '#ffffff',
            fingerprintId: fingerprintId || 'unknown',
            ipAddress: userIP,
            friends: {},
            savedParties: []
          };
          
          await set(userRef, userData);
          showToast('Signup successful! Please login.');
          signupDiv.style.display = 'none';
          loginDiv.style.display = 'block';
        }
      } catch (err) {
        showToast('Error during signup: ' + err);
      }
    } else {
      showToast('Please enter both username and password.');
    }
  });

  // Login
  loginBtn.addEventListener('click', async () => {
    const username = loginUsername.value.trim();
    const password = loginPassword.value;

    if (username && password) {
      try {
        await checkBanned();
        const userRef = ref(db, `users/${username}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists() && snapshot.val().password === password) {
          const userData = snapshot.val();
          const userIP = await getIPAddress();
          
          currentUser = {
            username,
            isAdmin: userData.isAdmin || false,
            displayName: userData.displayName || username,
            displayNameColor: userData.displayNameColor || '#ffffff',
            fingerprintId: fingerprintId || 'unknown',
            ipAddress: userIP
          };
          
          localStorage.setItem('user', JSON.stringify(currentUser));
          await set(ref(db, `online/${username}`), true);
          await update(ref(db, `users/${username}`), { 
            fingerprintId: fingerprintId || 'unknown',
            ipAddress: userIP
          });
          
          showMenu();
          showToast('Login successful.');
          setupNotificationCheck();
          loadSavedParties();
        } else {
          showToast('Invalid username or password.');
        }
      } catch (err) {
        showToast('Error during login: ' + err);
      }
    }
  });

  // Rest of the functions would continue here...
  // (I'll need to convert the rest of the JavaScript to TypeScript)
  
  // For now, let me update the HTML and CSS first, then complete the TypeScript conversion
});

