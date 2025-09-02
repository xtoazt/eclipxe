import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, get, remove } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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

document.addEventListener('DOMContentLoaded', () => {
  let isTabActive = true;
  
  document.addEventListener('visibilitychange', () => {
    isTabActive = !document.hidden;
  });

  function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  function showNotification(username, message) {
    if (!isTabActive && 'Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`${username} in Eclipse`, {
        body: message,
        icon: 'favicon.png',
        badge: 'favicon.png',
        tag: 'eclipse-message',
        renotify: true
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      setTimeout(() => notification.close(), 5000);
    }
  }

  requestNotificationPermission();

  // Theme management
  function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  }

  function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  }

  // Saved parties management
  function getSavedParties() {
    return JSON.parse(localStorage.getItem('savedParties') || '[]');
  }

  function saveParty(code, name) {
    const savedParties = getSavedParties();
    const existingIndex = savedParties.findIndex(p => p.code === code);
    
    if (existingIndex >= 0) {
      savedParties[existingIndex].name = name;
    } else {
      savedParties.push({ code, name, savedAt: Date.now() });
    }
    
    localStorage.setItem('savedParties', JSON.stringify(savedParties));
    showToast(`Party "${name}" saved successfully`);
  }

  function removeSavedParty(code) {
    const savedParties = getSavedParties().filter(p => p.code !== code);
    localStorage.setItem('savedParties', JSON.stringify(savedParties));
    loadSavedParties();
  }

  function loadSavedParties() {
    const savedParties = getSavedParties();
    savedPartiesList.innerHTML = '';
    
    if (savedParties.length === 0) {
      savedPartiesList.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 20px;">no saved parties</div>';
      return;
    }

    savedParties.forEach(party => {
      const item = document.createElement('div');
      item.className = 'saved-party-item';
      item.innerHTML = `
        <div class="saved-party-info">
          <div class="saved-party-name">${party.name}</div>
          <div class="saved-party-code">${party.code}</div>
        </div>
        <div class="saved-party-actions">
          <button onclick="joinSavedParty('${party.code}')">join</button>
          <button onclick="removeSavedParty('${party.code}')" style="color: var(--text-muted);">remove</button>
        </div>
      `;
      savedPartiesList.appendChild(item);
    });
  }

  window.joinSavedParty = (code) => {
    localStorage.setItem('partyCode', code);
    partyCodeDisplay.textContent = code;
    savedPartiesDiv.style.display = 'none';
    loadPartyChat(code);
  };

  window.removeSavedParty = removeSavedParty;
  const signupDiv = document.getElementById('signup');
  const loginDiv = document.getElementById('login');
  const chatDiv = document.getElementById('chat');
  const signupUsername = document.getElementById('signupUsername');
  const signupPassword = document.getElementById('signupPassword');
  const toggleSignupPassword = document.getElementById('toggleSignupPassword');
  const signupBtn = document.getElementById('signupBtn');
  const loginUsername = document.getElementById('loginUsername');
  const loginPassword = document.getElementById('loginPassword');
  const toggleLoginPassword = document.getElementById('toggleLoginPassword');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const displayName = document.getElementById('displayName');
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
  const joinPartySubmitBtn = document.getElementById('joinPartySubmitBtn');
  const leavePartyBtn = document.getElementById('leavePartyBtn');
  const partyCodeDisplay = document.getElementById('partyCodeDisplay');
  const deletePartyBtn = document.getElementById('deletePartyBtn');
  const savePartyBtn = document.getElementById('savePartyBtn');
  const themeToggle = document.getElementById('themeToggle');
  const savedPartiesBtn = document.getElementById('savedPartiesBtn');
  const savedPartiesDiv = document.getElementById('savedParties');
  const savedPartiesList = document.getElementById('savedPartiesList');
  const backToMenuFromSaved = document.getElementById('backToMenuFromSaved');
  const savePartyModal = document.getElementById('savePartyModal');
  const partyNameInput = document.getElementById('partyNameInput');
  const confirmSaveParty = document.getElementById('confirmSaveParty');
  const cancelSaveParty = document.getElementById('cancelSaveParty');
  const menuDisplayName = document.getElementById('menuDisplayName');

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

  signupBtn.addEventListener('click', () => {
    const username = signupUsername.value.trim();
    const password = signupPassword.value;

    if (username && password) {
      const userRef = ref(db, `users/${username}`);
      get(userRef)
        .then(snapshot => {
          if (snapshot.exists()) {
            showToast('An account with this username already exists.');
          } else {
            set(userRef, { password })
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
      const userRef = ref(db, `users/${username}`);
      get(userRef)
        .then(snapshot => {
          if (snapshot.exists() && snapshot.val().password === password) {
            localStorage.setItem('user', JSON.stringify({ username }));
            set(ref(db, `online/${username}`), true);
            showMenu();
            showToast('Login successful.');
          } else {
            showToast('Invalid username or password.');
          }
        })
        .catch(err => showToast('Error during login: ' + err));
    }
  });

  messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();  
      sendBtn.click();  
    }
  });

  // For Signup
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

  // For Login
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
      const messagesRef = partyCode ? ref(db, `parties/${partyCode}/messages`) : ref(db, 'messages');
      push(messagesRef, { username: currentUser.username, text });
      messageInput.value = '';
    }
  });

  logoutBtn.addEventListener('click', () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    set(ref(db, `online/${currentUser.username}`), null);
    localStorage.removeItem('user');
    chatDiv.style.display = 'none';
    loginDiv.style.display = 'block';
  });

  // Adding the delete account functionality
  deleteAccountBtn.addEventListener('click', () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const username = currentUser.username;

    // Confirm the deletion with the user
    if (confirm(`Are you sure you want to delete your account, ${username}? This action is irreversible.`)) {
      // Delete the user data from Firebase (just remove the user from users and online)
      const userRef = ref(db, `users/${username}`);
      const onlineRef = ref(db, `online/${username}`);

      // Remove the user from the users list
      set(userRef, null)
        .then(() => {
          // Remove the user from the online users list
          set(onlineRef, null)
            .then(() => {
              // Clear the local storage
              localStorage.removeItem('user');
              showToast('Your account has been deleted.');
              window.location.reload(); // Reload the page
            })
            .catch(err => showToast('Error removing from online users: ' + err));
        })
        .catch(err => showToast('Error deleting account: ' + err));
    }
  });

  // Function to generate a random party code
  function generatePartyCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }

  // Function to show the menu
  function showMenu() {
    loginDiv.style.display = 'none';
    signupDiv.style.display = 'none';
    chatDiv.style.display = 'none';
    createPartyDiv.style.display = 'none';
    joinPartyDiv.style.display = 'none';
    menuDiv.style.display = 'block';
    const currentUser = JSON.parse(localStorage.getItem('user'));
    menuDisplayName.textContent = currentUser.username;
  }

  globalChatBtn.addEventListener('click', () => {
    menuDiv.style.display = 'none';
    loadGlobalPartyChat();
  });
  
  function loadGlobalPartyChat() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    
    // Check if the global party already exists
    const globalPartyCode = "ECLIPSE";  // Set a fixed global party code
    get(ref(db, `parties/${globalPartyCode}`))
      .then(snapshot => {
        if (!snapshot.exists()) {
          // If the global party doesn't exist, create it
          set(ref(db, `parties/${globalPartyCode}`), {
            creator: "System", // Creator is the system for global chat
            messages: {}
          }).then(() => {
            showToast('Global party created.');
            joinGlobalParty(currentUser.username, globalPartyCode);
          }).catch(err => showToast('Error creating global party: ' + err));
        } else {
          // If the global party exists, just join it
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
    displayName.textContent = currentUser.username;
  
    const messagesRef = ref(db, `parties/${globalPartyCode}/messages`);
    let lastMessageCount = 0;
    
    onValue(messagesRef, (snapshot) => {
      messagesDiv.innerHTML = '';
      const messages = snapshot.val();
      const messageArray = [];
      
      for (const key in messages) {
        messageArray.push(messages[key]);
      }
      
      if (messageArray.length > lastMessageCount && lastMessageCount > 0) {
        const newMessage = messageArray[messageArray.length - 1];
        if (newMessage.username !== currentUser.username) {
          showNotification(newMessage.username, newMessage.text);
        }
      }
      lastMessageCount = messageArray.length;
      
      for (const msg of messageArray) {
        const div = document.createElement('div');
        div.className = 'message';
        div.textContent = `${msg.username}: ${msg.text}`;
        messagesDiv.appendChild(div);
      }
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
  
    deletePartyBtn.style.display = 'none'; 
  }
  
  sendBtn.addEventListener('click', () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const text = messageInput.value.trim();
    const partyCode = localStorage.getItem('partyCode');
  
    if (text) {
      const messagesRef = ref(db, `parties/${partyCode}/messages`);
      push(messagesRef, { username: currentUser.username, text });
      messageInput.value = '';
    }
  });  

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
  backToMenuFromSaved.addEventListener('click', showMenu);

  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);

  // Saved parties functionality
  savedPartiesBtn.addEventListener('click', () => {
    menuDiv.style.display = 'none';
    savedPartiesDiv.style.display = 'block';
    loadSavedParties();
  });

  // Save party functionality
  savePartyBtn.addEventListener('click', () => {
    const currentPartyCode = localStorage.getItem('partyCode');
    if (currentPartyCode) {
      savePartyModal.style.display = 'flex';
      partyNameInput.focus();
    } else {
      showToast('No active party to save');
    }
  });

  confirmSaveParty.addEventListener('click', () => {
    const name = partyNameInput.value.trim();
    const currentPartyCode = localStorage.getItem('partyCode');
    
    if (name && currentPartyCode) {
      saveParty(currentPartyCode, name);
      savePartyModal.style.display = 'none';
      partyNameInput.value = '';
    } else {
      showToast('Please enter a party name');
    }
  });

  cancelSaveParty.addEventListener('click', () => {
    savePartyModal.style.display = 'none';
    partyNameInput.value = '';
  });

  // Close modal on outside click
  savePartyModal.addEventListener('click', (e) => {
    if (e.target === savePartyModal) {
      savePartyModal.style.display = 'none';
      partyNameInput.value = '';
    }
  });

  joinPartySubmitBtn.addEventListener('click', () => {
    const partyCode = joinPartyCodeInput.value.trim();
    if (partyCode) {
      get(ref(db, `parties/${partyCode}`))
        .then(snapshot => {
          if (snapshot.exists()) {
            localStorage.setItem('partyCode', partyCode);
            partyCodeDisplay.textContent = partyCode;
            joinPartyDiv.style.display = 'none';
            loadPartyChat(partyCode);
            showToast('Joined party successfully.');
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
    displayName.textContent = currentUser.username;
    partyCodeDisplay.textContent = partyCode;

    const messagesRef = ref(db, `parties/${partyCode}/messages`);
    let lastMessageCount = 0;
    
    onValue(messagesRef, (snapshot) => {
      messagesDiv.innerHTML = '';
      const messages = snapshot.val();
      const messageArray = [];
      
      for (const key in messages) {
        messageArray.push(messages[key]);
      }
      
      if (messageArray.length > lastMessageCount && lastMessageCount > 0) {
        const newMessage = messageArray[messageArray.length - 1];
        if (newMessage.username !== currentUser.username) {
          showNotification(newMessage.username, newMessage.text);
        }
      }
      lastMessageCount = messageArray.length;
      
      for (const msg of messageArray) {
        const div = document.createElement('div');
        div.className = 'message';
        div.textContent = `${msg.username}: ${msg.text}`;
        messagesDiv.appendChild(div);
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

  function loadChat() {
    showMenu();
  }

  const currentUser = JSON.parse(localStorage.getItem('user'));
  if (currentUser) showMenu();
  else loginDiv.style.display = 'block';

  if (leavePartyBtn) {
    leavePartyBtn.addEventListener('click', leaveParty);
  } else {
    console.error('leavePartyBtn not found');
  }

  if (deletePartyBtn) {
    deletePartyBtn.addEventListener('click', deleteParty);
  } else {
    console.error('deletePartyBtn not found');
  }

  // Initialize theme and particles after all elements are defined
  initializeTheme();
  
  // Create particle effects
  function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
      particlesContainer.appendChild(particle);
    }
  }

  createParticles();

  function leaveParty() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const partyCode = localStorage.getItem('partyCode');

    if (currentUser && partyCode) {
      const userRef = ref(db, `parties/${partyCode}/users/${currentUser.username}`);
      remove(userRef)
        .then(() => {
          showToast('You have left the party.');
          chatDiv.style.display = 'none';
          showMenu();
        })
        .catch(err => showToast('Error leaving party: ' + err));
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
                chatDiv.style.display = 'none';
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
});
