import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, get, remove, update } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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
const db = getDatabase(app);

// Initialize FingerprintJS
let fingerprintId = null;
if (typeof FingerprintJS !== 'undefined') {
  FingerprintJS.load({ apiKey: 'gZRHetiksU9DkAqTJCCN' }).then(fp => {
    fp.get().then(result => {
      fingerprintId = result.visitorId;
      console.log('Fingerprint ID:', fingerprintId);
    });
  });
} else {
  // Fallback if FingerprintJS fails to load
  setTimeout(() => {
    if (typeof FingerprintJS !== 'undefined') {
      FingerprintJS.load({ apiKey: 'gZRHetiksU9DkAqTJCCN' }).then(fp => {
        fp.get().then(result => {
          fingerprintId = result.visitorId;
          console.log('Fingerprint ID:', fingerprintId);
        });
      });
    }
  }, 1000);
}

// Notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

let currentDmUser = null;
let notificationCheckInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  const signupDiv = document.getElementById('signup');
  const loginDiv = document.getElementById('login');
  const chatDiv = document.getElementById('chat');
  const signupUsername = document.getElementById('signupUsername');
  const signupPassword = document.getElementById('signupPassword');
  const signupAdminCode = document.getElementById('signupAdminCode');
  const toggleSignupPassword = document.getElementById('toggleSignupPassword');
  const signupBtn = document.getElementById('signupBtn');
  const loginUsername = document.getElementById('loginUsername');
  const loginPassword = document.getElementById('loginPassword');
  const toggleLoginPassword = document.getElementById('toggleLoginPassword');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const displayName = document.getElementById('displayName');
  const menuDisplayName = document.getElementById('menuDisplayName');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const messagesDiv = document.getElementById('messages');
  const toSignup = document.getElementById('toSignup');
  const toLogin = document.getElementById('toLogin');
  const deleteAccountBtn = document.getElementById('deleteAccountBtn');
  const menuDiv = document.getElementById('menu');
  const createPartyDiv = document.getElementById('createParty');
  const joinPartyDiv = document.getElementById('joinParty');
  const globalChatBtn = document.getElementById('globalChatBtn');
  const createPartyBtn = document.getElementById('createPartyBtn');
  const joinPartyBtn = document.getElementById('joinPartyBtn');
  const backToMenuFromCreate = document.getElementById('backToMenuFromCreate');
  const backToMenuFromJoin = document.getElementById('backToMenuFromJoin');
  const partyCodeSpan = document.getElementById('partyCode');
  const joinPartyCodeInput = document.getElementById('joinPartyCode');
  const leavePartyBtn = document.getElementById('leavePartyBtn');
  const partyCodeDisplay = document.getElementById('partyCodeDisplay');
  const deletePartyBtn = document.getElementById('deletePartyBtn');
  const friendsBtn = document.getElementById('friendsBtn');
  const dmsBtn = document.getElementById('dmsBtn');
  const changeDisplayNameBtn = document.getElementById('changeDisplayNameBtn');
  const changeColorBtn = document.getElementById('changeColorBtn');
  const requestColorCodeBtn = document.getElementById('requestColorCodeBtn');
  const adminPanelBtn = document.getElementById('adminPanelBtn');

  // Modal elements
  const changeDisplayNameModal = document.getElementById('changeDisplayNameModal');
  const changeColorModal = document.getElementById('changeColorModal');
  const friendsModal = document.getElementById('friendsModal');
  const dmsModal = document.getElementById('dmsModal');
  const adminPanelModal = document.getElementById('adminPanelModal');
  const newDisplayNameInput = document.getElementById('newDisplayNameInput');
  const saveDisplayNameBtn = document.getElementById('saveDisplayNameBtn');
  const colorCodeInput = document.getElementById('colorCodeInput');
  const saveColorBtn = document.getElementById('saveColorBtn');
  const friendsList = document.getElementById('friendsList');
  const partyMembersList = document.getElementById('partyMembersList');
  const dmUsersList = document.getElementById('dmUsersList');
  const dmMessages = document.getElementById('dmMessages');
  const dmInput = document.getElementById('dmInput');
  const sendDmBtn = document.getElementById('sendDmBtn');
  const generateCodeBtn = document.getElementById('generateCodeBtn');
  const codeExpiryHours = document.getElementById('codeExpiryHours');
  const generatedCodeDisplay = document.getElementById('generatedCodeDisplay');
  const banUsernameInput = document.getElementById('banUsernameInput');
  const banUserBtn = document.getElementById('banUserBtn');
  const banFingerprintInput = document.getElementById('banFingerprintInput');
  const banFingerprintBtn = document.getElementById('banFingerprintBtn');
  const codeRequestsList = document.getElementById('codeRequestsList');
  const savedPartiesList = document.getElementById('savedPartiesList');

  const togglePasswordVisibility = (input, toggleBtn) => {
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

  function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
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

  function sendNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: 'favicon.png' });
    }
  }

  function checkBanned() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser || !fingerprintId) return;

    get(ref(db, `banned/users/${currentUser.username}`))
      .then(snapshot => {
        if (snapshot.exists()) {
          showToast('You have been banned.');
          localStorage.removeItem('user');
          window.location.reload();
        }
      });

    get(ref(db, `banned/fingerprints/${fingerprintId}`))
      .then(snapshot => {
        if (snapshot.exists()) {
          showToast('This device has been banned.');
          localStorage.removeItem('user');
          window.location.reload();
        }
      });
  }

  signupBtn.addEventListener('click', () => {
    const username = signupUsername.value.trim();
    const password = signupPassword.value;
    const adminCode = signupAdminCode.value.trim();
    const isAdmin = adminCode === '123asd';

    if (username && password) {
      const userRef = ref(db, `users/${username}`);
      get(userRef)
        .then(snapshot => {
          if (snapshot.exists()) {
            showToast('An account with this username already exists.');
          } else {
            const userData = {
              password,
              isAdmin: isAdmin || false,
              displayName: username,
              displayNameColor: '#e0e0e0',
              fingerprintId: fingerprintId || 'unknown',
              friends: {},
              savedParties: []
            };
            set(userRef, userData)
              .then(() => {
                showToast('Signup successful! Please login.');
                signupDiv.style.display = 'none';
                loginDiv.style.display = 'block';
              })
              .catch(err => showToast('Error during signup: ' + err));
          }
        })
        .catch(err => showToast('Error checking username: ' + err));
    } else {
      showToast('Please enter both username and password.');
    }
  });

  loginBtn.addEventListener('click', () => {
    const username = loginUsername.value.trim();
    const password = loginPassword.value;

    if (username && password) {
      checkBanned();
      const userRef = ref(db, `users/${username}`);
      get(userRef)
        .then(snapshot => {
          if (snapshot.exists() && snapshot.val().password === password) {
            const userData = snapshot.val();
            localStorage.setItem('user', JSON.stringify({ 
              username,
              isAdmin: userData.isAdmin || false,
              displayName: userData.displayName || username,
              displayNameColor: userData.displayNameColor || '#e0e0e0'
            }));
            set(ref(db, `online/${username}`), true);
            update(ref(db, `users/${username}`), { fingerprintId: fingerprintId || 'unknown' });
            showMenu();
            showToast('Login successful.');
            setupNotificationCheck();
            loadSavedParties();
          } else {
            showToast('Invalid username or password.');
          }
        })
        .catch(err => showToast('Error during login: ' + err));
    }
  });

  function setupNotificationCheck() {
    if (notificationCheckInterval) clearInterval(notificationCheckInterval);
    
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const partyCode = localStorage.getItem('partyCode');
    let lastMessageTime = Date.now();

    notificationCheckInterval = setInterval(() => {
      if (!document.hasFocus() && partyCode) {
        const messagesRef = ref(db, `parties/${partyCode}/messages`);
        get(messagesRef).then(snapshot => {
          if (snapshot.exists()) {
            const messages = snapshot.val();
            const messageKeys = Object.keys(messages);
            if (messageKeys.length > 0) {
              const lastMessage = messages[messageKeys[messageKeys.length - 1]];
              if (lastMessage.username !== currentUser.username && Date.now() - lastMessageTime > 5000) {
                sendNotification('New Message', `${lastMessage.username}: ${lastMessage.text}`);
                lastMessageTime = Date.now();
              }
            }
          }
        });
      }
    }, 5000);
  }

  function loadSavedParties() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) return;

    get(ref(db, `users/${currentUser.username}/savedParties`))
      .then(snapshot => {
        savedPartiesList.innerHTML = '';
        const savedParties = snapshot.exists() ? snapshot.val() : [];
        if (savedParties.length === 0) {
          savedPartiesList.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No saved parties</p>';
          return;
        }
        savedParties.forEach(partyCode => {
          const item = document.createElement('div');
          item.className = 'saved-party-item';
          item.innerHTML = `
            <span>${partyCode}</span>
            <div>
              <button onclick="joinSavedParty('${partyCode}')">Join</button>
              <button onclick="removeSavedParty('${partyCode}')">Remove</button>
            </div>
          `;
          savedPartiesList.appendChild(item);
        });
      });
  }

  window.joinSavedParty = (partyCode) => {
    get(ref(db, `parties/${partyCode}`))
      .then(snapshot => {
        if (snapshot.exists()) {
          localStorage.setItem('partyCode', partyCode);
          partyCodeDisplay.textContent = partyCode;
          joinPartyDiv.style.display = 'none';
          menuDiv.style.display = 'none';
          loadPartyChat(partyCode);
          showToast('Joined party successfully.');
        } else {
          showToast('Party no longer exists.');
        }
      });
  };

  window.removeSavedParty = (partyCode) => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    get(ref(db, `users/${currentUser.username}/savedParties`))
      .then(snapshot => {
        const savedParties = snapshot.exists() ? snapshot.val() : [];
        const updated = savedParties.filter(p => p !== partyCode);
        set(ref(db, `users/${currentUser.username}/savedParties`), updated)
          .then(() => {
            showToast('Party removed from saved.');
            loadSavedParties();
          });
      });
  };

  messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();  
      sendBtn.click();  
    }
  });

  signupUsername.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      signupBtn.click();
    }
  });

  signupPassword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      signupBtn.click();
    }
  });

  loginUsername.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      loginBtn.click();
    }
  });

  loginPassword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      loginBtn.click();
    }
  });

  sendBtn.addEventListener('click', () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const text = messageInput.value.trim();
    const partyCode = localStorage.getItem('partyCode');

    if (text) {
      const messagesRef = ref(db, `parties/${partyCode}/messages`);
      push(messagesRef, { 
        username: currentUser.username,
        displayName: currentUser.displayName,
        displayNameColor: currentUser.displayNameColor,
        isAdmin: currentUser.isAdmin,
        text,
        timestamp: Date.now()
      });
      messageInput.value = '';
    }
  });

  logoutBtn.addEventListener('click', () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    set(ref(db, `online/${currentUser.username}`), null);
    localStorage.removeItem('user');
    localStorage.removeItem('partyCode');
    if (notificationCheckInterval) clearInterval(notificationCheckInterval);
    chatDiv.style.display = 'none';
    loginDiv.style.display = 'block';
  });

  deleteAccountBtn.addEventListener('click', () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const username = currentUser.username;

    if (confirm(`Are you sure you want to delete your account, ${username}? This action is irreversible.`)) {
      const userRef = ref(db, `users/${username}`);
      const onlineRef = ref(db, `online/${username}`);

      set(userRef, null)
        .then(() => {
          set(onlineRef, null)
            .then(() => {
              localStorage.removeItem('user');
              showToast('Your account has been deleted.');
              window.location.reload();
            })
            .catch(err => showToast('Error removing from online users: ' + err));
        })
        .catch(err => showToast('Error deleting account: ' + err));
    }
  });

  function generatePartyCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }

  function showMenu() {
    loginDiv.style.display = 'none';
    signupDiv.style.display = 'none';
    chatDiv.style.display = 'none';
    createPartyDiv.style.display = 'none';
    joinPartyDiv.style.display = 'none';
    menuDiv.style.display = 'block';
    const currentUser = JSON.parse(localStorage.getItem('user'));
    menuDisplayName.textContent = currentUser.displayName || currentUser.username;
    menuDisplayName.style.color = currentUser.displayNameColor || '#e0e0e0';
    if (currentUser.isAdmin) {
      menuDisplayName.classList.add('admin-name');
      adminPanelBtn.style.display = 'block';
    } else {
      menuDisplayName.classList.remove('admin-name');
      adminPanelBtn.style.display = 'none';
    }
    loadSavedParties();
  }

  globalChatBtn.addEventListener('click', () => {
    menuDiv.style.display = 'none';
    loadGlobalPartyChat();
  });
  
  function loadGlobalPartyChat() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const globalPartyCode = "ECLIPSE";
    get(ref(db, `parties/${globalPartyCode}`))
      .then(snapshot => {
        if (!snapshot.exists()) {
          set(ref(db, `parties/${globalPartyCode}`), {
            creator: "System",
            messages: {}
          }).then(() => {
            joinGlobalParty(currentUser.username, globalPartyCode);
          }).catch(err => showToast('Error creating global party: ' + err));
        } else {
          joinGlobalParty(currentUser.username, globalPartyCode);
        }
      })
      .catch(err => showToast('Error checking global party: ' + err));
  }
  
  function joinGlobalParty(username, globalPartyCode) {
    localStorage.setItem('partyCode', globalPartyCode);
    partyCodeDisplay.textContent = globalPartyCode;
    chatDiv.style.display = 'block';
    const currentUser = JSON.parse(localStorage.getItem('user'));
    displayName.textContent = currentUser.displayName || currentUser.username;
    displayName.style.color = currentUser.displayNameColor || '#e0e0e0';
    if (currentUser.isAdmin) {
      displayName.classList.add('admin-name');
    }
    setupNotificationCheck();
    savePartyToUser(globalPartyCode);

    const messagesRef = ref(db, `parties/${globalPartyCode}/messages`);
    onValue(messagesRef, (snapshot) => {
      messagesDiv.innerHTML = '';
      const messages = snapshot.val();
      if (messages) {
        for (const key in messages) {
          const msg = messages[key];
          const div = document.createElement('div');
          div.className = 'message';
          const usernameSpan = document.createElement('span');
          usernameSpan.className = 'message-username';
          usernameSpan.textContent = (msg.displayName || msg.username) + ':';
          usernameSpan.style.color = msg.displayNameColor || '#e0e0e0';
          if (msg.isAdmin) {
            usernameSpan.classList.add('admin-name');
          }
          div.appendChild(usernameSpan);
          div.appendChild(document.createTextNode(' ' + msg.text));
          messagesDiv.appendChild(div);
        }
      }
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
  
    deletePartyBtn.style.display = 'none'; 
  }

  function savePartyToUser(partyCode) {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    get(ref(db, `users/${currentUser.username}/savedParties`))
      .then(snapshot => {
        const savedParties = snapshot.exists() ? snapshot.val() : [];
        if (!savedParties.includes(partyCode)) {
          savedParties.push(partyCode);
          set(ref(db, `users/${currentUser.username}/savedParties`), savedParties);
        }
      });
  }

  createPartyBtn.addEventListener('click', () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const partyCode = generatePartyCode();
    set(ref(db, `parties/${partyCode}`), { creator: currentUser.username, messages: {} });
    partyCodeSpan.textContent = partyCode;
    menuDiv.style.display = 'none';
    createPartyDiv.style.display = 'block';
  });

  joinPartyBtn.addEventListener('click', () => {
    menuDiv.style.display = 'none';
    joinPartyDiv.style.display = 'block';
  });

  backToMenuFromCreate.addEventListener('click', showMenu);
  backToMenuFromJoin.addEventListener('click', showMenu);

  joinPartySubmitBtn.addEventListener('click', () => {
    const partyCode = joinPartyCodeInput.value.trim().toUpperCase();
    if (partyCode) {
      get(ref(db, `parties/${partyCode}`))
        .then(snapshot => {
          if (snapshot.exists()) {
            localStorage.setItem('partyCode', partyCode);
            partyCodeDisplay.textContent = partyCode;
            joinPartyDiv.style.display = 'none';
            loadPartyChat(partyCode);
            showToast('Joined party successfully.');
            savePartyToUser(partyCode);
          } else {
            showToast('Invalid party code.');
          }
        })
        .catch(err => showToast('Error joining party: ' + err));
    }
  });

  function loadPartyChat(partyCode) {
    chatDiv.style.display = 'block';
    const currentUser = JSON.parse(localStorage.getItem('user'));
    displayName.textContent = currentUser.displayName || currentUser.username;
    displayName.style.color = currentUser.displayNameColor || '#e0e0e0';
    if (currentUser.isAdmin) {
      displayName.classList.add('admin-name');
    }
    partyCodeDisplay.textContent = partyCode;
    setupNotificationCheck();
    savePartyToUser(partyCode);

    const messagesRef = ref(db, `parties/${partyCode}/messages`);
    onValue(messagesRef, (snapshot) => {
      messagesDiv.innerHTML = '';
      const messages = snapshot.val();
      if (messages) {
        for (const key in messages) {
          const msg = messages[key];
          const div = document.createElement('div');
          div.className = 'message';
          const usernameSpan = document.createElement('span');
          usernameSpan.className = 'message-username';
          usernameSpan.textContent = (msg.displayName || msg.username) + ':';
          usernameSpan.style.color = msg.displayNameColor || '#e0e0e0';
          if (msg.isAdmin) {
            usernameSpan.classList.add('admin-name');
          }
          div.appendChild(usernameSpan);
          div.appendChild(document.createTextNode(' ' + msg.text));
          messagesDiv.appendChild(div);
        }
      }
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });

    get(ref(db, `parties/${partyCode}`))
      .then(snapshot => {
        if (snapshot.exists() && snapshot.val().creator === currentUser.username) {
          deletePartyBtn.style.display = 'block';
        } else {
          deletePartyBtn.style.display = 'none';
        }
      })
      .catch(err => console.error('Error checking party creator: ' + err));
  }

  if (leavePartyBtn) {
    leavePartyBtn.addEventListener('click', leaveParty);
  }

  if (deletePartyBtn) {
    deletePartyBtn.addEventListener('click', deleteParty);
  }

  function leaveParty() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const partyCode = localStorage.getItem('partyCode');

    if (currentUser && partyCode) {
      showToast('You have left the party.');
      localStorage.removeItem('partyCode');
      chatDiv.style.display = 'none';
      if (notificationCheckInterval) clearInterval(notificationCheckInterval);
      showMenu();
    } else {
      showToast('No party to leave.');
    }
  }

  function deleteParty() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const partyCode = localStorage.getItem('partyCode');

    if (currentUser && partyCode) {
      const partyRef = ref(db, `parties/${partyCode}`);
      get(partyRef)
        .then(snapshot => {
          if (snapshot.exists() && snapshot.val().creator === currentUser.username) {
            remove(partyRef)
              .then(() => {
                showToast('Party deleted successfully.');
                localStorage.removeItem('partyCode');
                chatDiv.style.display = 'none';
                if (notificationCheckInterval) clearInterval(notificationCheckInterval);
                showMenu();
              })
              .catch(err => showToast('Error deleting party: ' + err));
          } else {
            showToast('You are not the creator of this party.');
          }
        })
        .catch(err => showToast('Error checking party: ' + err));
    } else {
      showToast('No party to delete.');
    }
  }

  // Modal handlers
  const closeModal = (modal) => {
    modal.style.display = 'none';
  };

  document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      closeBtn.closest('.modal').style.display = 'none';
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });

  // Change Display Name
  changeDisplayNameBtn.addEventListener('click', () => {
    changeDisplayNameModal.style.display = 'block';
  });

  saveDisplayNameBtn.addEventListener('click', () => {
    const newDisplayName = newDisplayNameInput.value.trim();
    if (newDisplayName) {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      update(ref(db, `users/${currentUser.username}`), { displayName: newDisplayName });
      currentUser.displayName = newDisplayName;
      localStorage.setItem('user', JSON.stringify(currentUser));
      displayName.textContent = newDisplayName;
      menuDisplayName.textContent = newDisplayName;
      showToast('Display name updated.');
      closeModal(changeDisplayNameModal);
      newDisplayNameInput.value = '';
    }
  });

  // Change Color
  changeColorBtn.addEventListener('click', () => {
    changeColorModal.style.display = 'block';
  });

  saveColorBtn.addEventListener('click', () => {
    const colorCode = colorCodeInput.value.trim();
    if (colorCode) {
      get(ref(db, `colorCodes/${colorCode}`))
        .then(snapshot => {
          if (snapshot.exists()) {
            const codeData = snapshot.val();
            if (Date.now() < codeData.expiresAt) {
              const currentUser = JSON.parse(localStorage.getItem('user'));
              update(ref(db, `users/${currentUser.username}`), { displayNameColor: codeData.color });
              currentUser.displayNameColor = codeData.color;
              localStorage.setItem('user', JSON.stringify(currentUser));
              displayName.style.color = codeData.color;
              menuDisplayName.style.color = codeData.color;
              remove(ref(db, `colorCodes/${colorCode}`));
              showToast('Color updated.');
              closeModal(changeColorModal);
              colorCodeInput.value = '';
            } else {
              showToast('Code has expired.');
            }
          } else {
            showToast('Invalid color code.');
          }
        });
    }
  });

  // Request Color Code
  requestColorCodeBtn.addEventListener('click', () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    push(ref(db, 'codeRequests'), {
      username: currentUser.username,
      timestamp: Date.now()
    });
    showToast('Code request sent to admins.');
    
    // Notify all admins
    get(ref(db, 'users'))
      .then(snapshot => {
        if (snapshot.exists()) {
          const users = snapshot.val();
          Object.keys(users).forEach(username => {
            if (users[username].isAdmin) {
              get(ref(db, `online/${username}`))
                .then(onlineSnapshot => {
                  if (onlineSnapshot.exists()) {
                    sendNotification('Color Code Request', `${currentUser.username} requested a color code`);
                  }
                });
            }
          });
        }
      });
  });

  // Friends
  friendsBtn.addEventListener('click', () => {
    friendsModal.style.display = 'block';
    loadFriends();
    loadPartyMembers();
  });

  function loadFriends() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    get(ref(db, `users/${currentUser.username}/friends`))
      .then(snapshot => {
        friendsList.innerHTML = '';
        const friends = snapshot.exists() ? snapshot.val() : {};
        if (Object.keys(friends).length === 0) {
          friendsList.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No friends yet</p>';
        } else {
          Object.keys(friends).forEach(friendUsername => {
            const item = document.createElement('div');
            item.className = 'friend-item';
            item.innerHTML = `
              <span>${friendUsername}</span>
              <button onclick="removeFriend('${friendUsername}')">Remove</button>
            `;
            friendsList.appendChild(item);
          });
        }
      });
  }

  function loadPartyMembers() {
    const partyCode = localStorage.getItem('partyCode');
    if (!partyCode) {
      partyMembersList.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">Not in a party</p>';
      return;
    }
    
    const messagesRef = ref(db, `parties/${partyCode}/messages`);
    get(messagesRef).then(snapshot => {
      partyMembersList.innerHTML = '';
      const messages = snapshot.exists() ? snapshot.val() : {};
      const members = new Set();
      Object.values(messages).forEach(msg => {
        members.add(msg.username);
      });
      
      if (members.size === 0) {
        partyMembersList.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No members</p>';
      } else {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        members.forEach(username => {
          if (username !== currentUser.username) {
            get(ref(db, `users/${currentUser.username}/friends/${username}`))
              .then(friendSnapshot => {
                const isFriend = friendSnapshot.exists();
                const item = document.createElement('div');
                item.className = 'party-member-item';
                item.innerHTML = `
                  <span>${username}</span>
                  <button onclick="${isFriend ? `removeFriend('${username}')` : `addFriend('${username}')`}">
                    ${isFriend ? 'Remove Friend' : 'Add Friend'}
                  </button>
                `;
                partyMembersList.appendChild(item);
              });
          }
        });
      }
    });
  }

  window.addFriend = (username) => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    set(ref(db, `users/${currentUser.username}/friends/${username}`), true);
    showToast(`Added ${username} as friend.`);
    loadFriends();
    loadPartyMembers();
  };

  window.removeFriend = (username) => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    remove(ref(db, `users/${currentUser.username}/friends/${username}`));
    showToast(`Removed ${username} from friends.`);
    loadFriends();
    loadPartyMembers();
  };

  // DMs
  dmsBtn.addEventListener('click', () => {
    dmsModal.style.display = 'block';
    loadDMUsers();
  });

  function loadDMUsers() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    get(ref(db, `users/${currentUser.username}/friends`))
      .then(snapshot => {
        dmUsersList.innerHTML = '';
        const friends = snapshot.exists() ? snapshot.val() : {};
        if (Object.keys(friends).length === 0) {
          dmUsersList.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No friends to message</p>';
        } else {
          Object.keys(friends).forEach(friendUsername => {
            const item = document.createElement('div');
            item.className = 'dm-user-item';
            item.textContent = friendUsername;
            item.addEventListener('click', () => {
              currentDmUser = friendUsername;
              loadDMMessages(friendUsername);
              document.querySelectorAll('.dm-user-item').forEach(i => i.style.background = 'rgba(40, 40, 40, 0.6)');
              item.style.background = 'rgba(60, 60, 60, 0.8)';
            });
            dmUsersList.appendChild(item);
          });
        }
      });
  }

  function loadDMMessages(otherUser) {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const dmId = [currentUser.username, otherUser].sort().join('_');
    const messagesRef = ref(db, `dms/${dmId}/messages`);
    
    dmMessages.innerHTML = '';
    onValue(messagesRef, (snapshot) => {
      dmMessages.innerHTML = '';
      const messages = snapshot.val();
      if (messages) {
        Object.values(messages).forEach(msg => {
          const div = document.createElement('div');
          div.className = 'message';
          div.innerHTML = `<strong>${msg.username}:</strong> ${msg.text}`;
          dmMessages.appendChild(div);
        });
      }
      dmMessages.scrollTop = dmMessages.scrollHeight;
    });
  }

  sendDmBtn.addEventListener('click', () => {
    if (!currentDmUser) {
      showToast('Select a user to message.');
      return;
    }
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const text = dmInput.value.trim();
    if (text) {
      const dmId = [currentUser.username, currentDmUser].sort().join('_');
      push(ref(db, `dms/${dmId}/messages`), {
        username: currentUser.username,
        text,
        timestamp: Date.now()
      });
      dmInput.value = '';
    }
  });

  dmInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendDmBtn.click();
    }
  });

  // Admin Panel
  adminPanelBtn.addEventListener('click', () => {
    adminPanelModal.style.display = 'block';
    loadCodeRequests();
  });

  generateCodeBtn.addEventListener('click', () => {
    const hours = parseInt(codeExpiryHours.value) || 24;
    const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe', '#fd79a8', '#00b894'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    set(ref(db, `colorCodes/${code}`), {
      color,
      expiresAt: Date.now() + (hours * 60 * 60 * 1000),
      generatedBy: JSON.parse(localStorage.getItem('user')).username
    });
    
    generatedCodeDisplay.textContent = `Code: ${code} | Color: ${color} | Expires in ${hours} hours`;
    showToast('Code generated.');
  });

  function loadCodeRequests() {
    get(ref(db, 'codeRequests'))
      .then(snapshot => {
        codeRequestsList.innerHTML = '';
        const requests = snapshot.exists() ? snapshot.val() : {};
        if (Object.keys(requests).length === 0) {
          codeRequestsList.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No requests</p>';
        } else {
          Object.entries(requests).forEach(([key, request]) => {
            const item = document.createElement('div');
            item.className = 'code-request-item';
            item.innerHTML = `
              <div>
                <strong>${request.username}</strong>
                <div style="font-size: 12px; color: #888;">${new Date(request.timestamp).toLocaleString()}</div>
              </div>
              <button onclick="approveCodeRequest('${request.username}', '${key}')">Approve</button>
            `;
            codeRequestsList.appendChild(item);
          });
        }
      });
  }

  window.approveCodeRequest = (username, requestKey) => {
    const hours = 24;
    const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe', '#fd79a8', '#00b894'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    set(ref(db, `colorCodes/${code}`), {
      color,
      expiresAt: Date.now() + (hours * 60 * 60 * 1000),
      generatedBy: JSON.parse(localStorage.getItem('user')).username
    });
    
    push(ref(db, `users/${username}/colorCodes`), code);
    remove(ref(db, `codeRequests/${requestKey}`));
    showToast(`Code sent to ${username}.`);
    loadCodeRequests();
  };

  banUserBtn.addEventListener('click', () => {
    const username = banUsernameInput.value.trim();
    if (username) {
      set(ref(db, `banned/users/${username}`), true);
      showToast(`${username} has been banned.`);
      banUsernameInput.value = '';
    }
  });

  banFingerprintBtn.addEventListener('click', () => {
    const fingerprint = banFingerprintInput.value.trim();
    if (fingerprint) {
      set(ref(db, `banned/fingerprints/${fingerprint}`), true);
      showToast(`Device ${fingerprint} has been banned.`);
      banFingerprintInput.value = '';
    }
  });

  // Initialize
  const currentUser = JSON.parse(localStorage.getItem('user'));
  if (currentUser) {
    checkBanned();
    showMenu();
  } else {
    loginDiv.style.display = 'block';
  }

  // Page visibility for notifications
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      setupNotificationCheck();
    } else {
      if (notificationCheckInterval) clearInterval(notificationCheckInterval);
    }
  });
});
