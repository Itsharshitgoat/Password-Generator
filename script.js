const symbols = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'];
const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generatePassword() {
    let numbers = '';
    for (let i = 0; i < 4; i++) {
        numbers += Math.floor(Math.random() * 10);
    }    
    let lettersPart = '';
    for (let i = 0; i < 7; i++) {
        lettersPart += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    let symbol = symbols[Math.floor(Math.random() * symbols.length)];
    let password = numbers + symbol + lettersPart;
    document.getElementById('password').innerHTML = password;
}
function copyPassword() {
    const password = document.getElementById('password').textContent;
    if (password === "hit generate") {
        alert("Please generate a password first!");
        return;
    }
    navigator.clipboard.writeText(password).then(() => {
        alert("Password copied to clipboard!");
    }, (err) => {
        alert("Failed to copy password: " + err);
    });
}

function checkStrength() {
    const password = document.getElementById('passwordInput').value;
    const bar = document.getElementById('strengthBar');
    const label = document.getElementById('strengthLabel');
    const scoreEl = document.getElementById('strengthScore');
    const crackEl = document.getElementById('crackTime');
    const feedbackEl = document.getElementById('feedbackList');

    if (password.length === 0) {
        bar.style.width = '0%';
        bar.style.backgroundColor = 'transparent';
        label.textContent = '';
        scoreEl.textContent = '';
        crackEl.textContent = '';
        feedbackEl.innerHTML = '';
        return;
    }

    const result = analyzePassword(password);

    const levels = [
        { min: 0,  label: 'Very Weak',  color: '#e74c3c', width: '10%' },
        { min: 20, label: 'Weak',        color: '#e74c3c', width: '25%' },
        { min: 40, label: 'Fair',        color: '#f39c12', width: '50%' },
        { min: 60, label: 'Strong',      color: '#2ecc71', width: '75%' },
        { min: 80, label: 'Very Strong', color: '#27ae60', width: '100%' }
    ];

    let level = levels[0];
    for (const l of levels) {
        if (result.score >= l.min) level = l;
    }

    bar.style.width = level.width;
    bar.style.backgroundColor = level.color;
    label.textContent = level.label;
    label.style.color = level.color;
    scoreEl.textContent = 'Score: ' + result.score + '/100';
    crackEl.textContent = 'Crack time: ' + result.crackTime;

    feedbackEl.innerHTML = '';
    var icons = { warn: '\u26a0', info: '\u2139', good: '\u2713' };
    result.feedback.forEach(function(f) {
        var li = document.createElement('li');
        li.className = 'note ' + f.type;
        li.innerHTML = '<span class="note-icon">' + icons[f.type] + '</span>' + f.message;
        feedbackEl.appendChild(li);
    });
}

function analyzePassword(pw) {
    var feedback = [];
    var score = 0;
    var lower = pw.toLowerCase();

    var COMMON_PASSWORDS = [
        'password','123456','12345678','qwerty','abc123','monkey','1234567',
        'letmein','trustno1','dragon','baseball','iloveyou','master','sunshine',
        'ashley','bailey','passw0rd','shadow','123123','654321','superman',
        'qazwsx','michael','football','password1','password123','welcome',
        'hello','charlie','donald','admin','login','starwars','solo','princess',
        'cheese','123456789','1234567890','000000','access','flower','hottie',
        'loveme','zaq1zaq1','qwerty123','1qaz2wsx','abc','xyz','111111',
        '121212','jennifer','hunter','buster','soccer','harley','batman',
        'andrew','tigger','sunshine','iloveu','2000','robert','thomas',
        'cricket','fuckyou','1234','matthew','jordan','amanda','summer',
        'love','ashley','nicole','chelsea','biteme','access','ranger',
        'daniel','robert','test','pass','killer','hockey','george',
        'pepper','zxcvbn','maggie','corvette','taylor','tucker','liverpool',
        'aspera','assist','australia','bingo','cookies','donkey','eagle',
        'falcon','global','hammer','india','jessica','julian','kevin',
        'london','matrix','ninja','online','phoenix','qwerty1','rocket',
        'single','system','travis','united','valentines','winston','xavier',
        'yamaha','zombie'
    ];

    var KEYBOARD_ROWS = [
        'qwertyuiop','asdfghjkl','zxcvbnm',
        '1234567890','-=[]\\;\',./',
        '`~!@#$%^&*()_+{}|:"<>?'
    ];

    var COMMON_WORDS = [
        'password','welcome','login','admin','master','dragon','letmein',
        'shadow','sunshine','princess','football','baseball','soccer',
        'hockey','batman','trustno1','iloveyou','batman','access',
        'hello','charlie','donald','thomas','robert','michael','jordan',
        'george','buster','pepper','eagle','hammer','falcon','ninja',
        'rocket','cricket','tucker','maggie','liverpool','system',
        'online','india','australia','phoenix','single','killer'
    ];

    var LEET_MAP = {
        '@':'a','4':'a','3':'e','1':'i','!':'i','0':'o',
        '$':'s','5':'s','7':'t','+':'t','8':'b','(':'c'
    };

    var seq = 'abcdefghijklmnopqrstuvwxyz';
    var seqRev = seq.split('').reverse().join('');
    var numSeq = '0123456789';
    var numSeqRev = '9876543210';

    function hasPattern(str, pattern, minLen) {
        if (str.length < minLen) return false;
        for (var i = 0; i <= str.length - minLen; i++) {
            var sub = str.substring(i, i + minLen);
            if (pattern.indexOf(sub) !== -1) return true;
        }
        return false;
    }

    function isKeyboardWalk(str) {
        var l = str.toLowerCase();
        for (var r = 0; r < KEYBOARD_ROWS.length; r++) {
            var row = KEYBOARD_ROWS[r];
            for (var len = 3; len <= l.length; len++) {
                for (var i = 0; i <= row.length - len; i++) {
                    if (l === row.substring(i, i + len)) return true;
                }
            }
        }
        return false;
    }

    function isRepeatingPattern(str) {
        var l = str.toLowerCase();
        for (var patLen = 1; patLen <= Math.floor(l.length / 2); patLen++) {
            var pat = l.substring(0, patLen);
            var repeated = '';
            while (repeated.length < l.length) repeated += pat;
            if (repeated === l && patLen < l.length) return true;
        }
        return false;
    }

    function leetDecode(str) {
        var result = '';
        for (var i = 0; i < str.length; i++) {
            result += LEET_MAP[str[i]] || str[i];
        }
        return result;
    }

    function containsDictionaryWord(str) {
        var l = leetDecode(str.toLowerCase());
        for (var i = 0; i < COMMON_WORDS.length; i++) {
            if (l.indexOf(COMMON_WORDS[i]) !== -1) return COMMON_WORDS[i];
        }
        return null;
    }

    function hasSequentialChars(str) {
        var l = str.toLowerCase();
        if (hasPattern(l, seq, 3)) return true;
        if (hasPattern(l, seqRev, 3)) return true;
        if (hasPattern(l, numSeq, 3)) return true;
        if (hasPattern(l, numSeqRev, 3)) return true;
        return false;
    }

    function hasRepeats(str) {
        if (/(.)\1{2,}/.test(str)) return true;
        return false;
    }

    function calcEntropy(str) {
        var pool = 0;
        if (/[a-z]/.test(str)) pool += 26;
        if (/[A-Z]/.test(str)) pool += 26;
        if (/[0-9]/.test(str)) pool += 10;
        if (/[^a-zA-Z0-9]/.test(str)) pool += 33;
        if (pool === 0) return 0;
        return str.length * Math.log2(pool);
    }

    function estimateCrackTime(entropy) {
        var guessesPerSec = 10e9;
        var totalGuesses = Math.pow(2, entropy);
        var seconds = totalGuesses / guessesPerSec / 2;

        var instantMessages = [
            "Even my grandma's parrot could guess this",
            "This password is basically just vibes",
            "I cracked this and I don't even have hands",
            "My Wi-Fi password is stronger than this",
            "This is the '1234' of passwords. Oh wait.",
            "I saw this password in a fortune cookie",
            "This password has never been to the gym",
            "Even autocorrect could fix this password"
        ];
        var secondsMessages = [
            "I cracked this during a yawn",
            "I literally sneezed and it was done",
            "My toaster could brute force this while making toast",
            "I took a sip of water and it was over",
            "This password lasted shorter than my attention span",
            "Even my dog's Instagram is more secure",
            "I cracked this while scrolling past your story",
            "This password has the shelf life of a free trial"
        ];
        var minutesMessages = [
            "I'd need to put on pants for this one",
            "I'm cracking this while my ramen cools down",
            "Long enough for me to pretend to be productive",
            "I'd need at least one bathroom break for this",
            "This is a 'finish my coffee first' kind of password",
            "I'd crack this while my AI generates a better one",
            "About as long as a 'quick 5 minute meeting' actually takes",
            "I could order DoorDash, eat, and still crack this"
        ];
        var hoursMessages = [
            "I'd need to meal prep for this one",
            "This is a 'skip the gym' kind of crack",
            "I'd need to set a reminder to finish cracking this",
            "Time to put on a Netflix series and get comfy",
            "I'd need to send out for groceries mid-crack",
            "This password survives my first hour of effort. Respect.",
            "I'd need a nap break somewhere in the middle",
            "Not worth the electricity bill, honestly"
        ];
        var daysMessages = [
            "I'd need to hire a guy who knows a guy",
            "This is a 'submit PTO request' kind of crack",
            "I'd need to set up a whole office for this",
            "Time to invest in a second monitor",
            "I'd have to explain to my boss why I'm cracking passwords",
            "My laptop would file a restraining order",
            "I'd need to update my LinkedIn to 'Professional Password Cracker'"
        ];
        var yearsMessages = [
            "I'd need to leave this in my will",
            "My kids would finish this for me",
            "I'd start this and my retirement home would finish it",
            "I'd need to make this a side hustle",
            "This is a 'start a podcast about it' kind of crack",
            "I'd need to move to another country first",
            "Even my student loans would be paid off before I finish",
            "I'd need to reinvent myself as a person for this one"
        ];
        var kYearsMessages = [
            "I'd need to invent a new planet for this one",
            "The dinosaurs would come back first",
            "I'd need to wait for the next ice age",
            "This password will outlive humanity",
            "I'd need to evolve into a WiFi signal",
            "The pyramids were built faster than this crack",
            "I'd need to learn a new language. Like, an alien one."
        ];
        var mYearsMessages = [
            "The sun is literally dying and I still can't crack this",
            "I'd need to wait for the universe to factory reset",
            "This password will witness the heat death of the universe",
            "Even my future ghost couldn't crack this",
            "I'd need to build a time machine and go back to try harder",
            "This password has seen civilizations rise and fall",
            "The universe is like 'nah bro, not this one'"
        ];
        var bYearsMessages = [
            "I can't even do the math. My calculator just quit.",
            "I tried to calculate this and my computer started crying",
            "This password is basically immortal",
            "God himself couldn't crack this. He'd just make a new universe.",
            "This password is the final boss of passwords",
            "Even the multiverse gave up on this one",
            "I whispered this password to the void and the void said 'nope'",
            "This password called my manager and got me fired from cracking"
        ];

        function pick(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }

        if (seconds < 1) return pick(instantMessages);
        if (seconds < 60) return pick(secondsMessages);
        if (seconds < 3600) return pick(minutesMessages);
        if (seconds < 86400) return pick(hoursMessages);
        if (seconds < 31536000) return pick(daysMessages);
        if (seconds < 31536000 * 100) return pick(yearsMessages);
        if (seconds < 31536000 * 1e6) return pick(kYearsMessages);
        if (seconds < 31536000 * 1e9) return pick(mYearsMessages);
        return pick(bYearsMessages);
    }

    var isCommon = false;
    for (var i = 0; i < COMMON_PASSWORDS.length; i++) {
        if (lower === COMMON_PASSWORDS[i]) { isCommon = true; break; }
    }

    if (isCommon) {
        score = 0;
        feedback.push({ type: 'warn', message: 'This is a widely used common password' });
    } else {
        score += 15;
    }

    var entropy = calcEntropy(pw);
    score += Math.min(Math.round(entropy / 100 * 30), 30);

    var lowerCount = 0, upperCount = 0, digitCount = 0, symbolCount = 0;
    for (var i = 0; i < pw.length; i++) {
        var c = pw[i];
        if (c >= 'a' && c <= 'z') lowerCount++;
        else if (c >= 'A' && c <= 'Z') upperCount++;
        else if (c >= '0' && c <= '9') digitCount++;
        else symbolCount++;
    }
    var typesUsed = (lowerCount > 0 ? 1 : 0) + (upperCount > 0 ? 1 : 0) + (digitCount > 0 ? 1 : 0) + (symbolCount > 0 ? 1 : 0);
    score += typesUsed * 5;

    if (pw.length < 8) {
        feedback.push({ type: 'warn', message: 'Too short (minimum 8 characters recommended)' });
    } else if (pw.length >= 16) {
        score += 15;
    } else if (pw.length >= 12) {
        score += 10;
    } else {
        score += 5;
    }

    if (typesUsed < 3) {
        feedback.push({ type: 'info', message: 'Use more character types (uppercase, lowercase, numbers, symbols)' });
    }

    var dictWord = containsDictionaryWord(pw);
    if (dictWord) {
        score -= 15;
        feedback.push({ type: 'warn', message: 'Contains common word "' + dictWord + '"' });
    }

    if (isKeyboardWalk(pw)) {
        score -= 20;
        feedback.push({ type: 'warn', message: 'Contains keyboard pattern (e.g. "qwerty" or "asdf")' });
    }

    if (hasSequentialChars(pw)) {
        score -= 10;
        feedback.push({ type: 'info', message: 'Contains sequential characters (e.g. "abc" or "123")' });
    }

    if (isRepeatingPattern(pw)) {
        score -= 15;
        feedback.push({ type: 'warn', message: 'Is a repeated pattern (e.g. "abcabc" or "1212")' });
    }

    if (hasRepeats(pw)) {
        score -= 5;
        feedback.push({ type: 'info', message: 'Contains repeated characters (e.g. "aaa" or "111")' });
    }

    if (/^[a-zA-Z]+$/.test(pw)) {
        score -= 5;
        feedback.push({ type: 'info', message: 'Only letters - add numbers and symbols' });
    }
    if (/^[0-9]+$/.test(pw)) {
        score -= 10;
        feedback.push({ type: 'warn', message: 'Only numbers - easy to guess' });
    }

    if (/^[A-Z]/.test(pw) && !/[a-z]/.test(pw)) {
        score -= 5;
    }
    if (/\d$/.test(pw)) {
        feedback.push({ type: 'info', message: 'Ending with a number is a common pattern' });
    }
    if (/[^a-zA-Z0-9]$/.test(pw)) {
        feedback.push({ type: 'info', message: 'Ending with a symbol is a common pattern' });
    }

    if (typesUsed === 4 && pw.length >= 16 && !isCommon && !dictWord && !isKeyboardWalk(pw) && !isRepeatingPattern(pw)) {
        score += 10;
    }

    var uniqueChars = {};
    for (var i = 0; i < pw.length; i++) uniqueChars[pw[i]] = true;
    var uniqueCount = Object.keys(uniqueChars).length;
    var uniqueRatio = uniqueCount / pw.length;
    if (uniqueRatio >= 0.8) {
        score += 5;
    } else if (uniqueRatio < 0.4) {
        score -= 5;
        feedback.push({ type: 'info', message: 'Low character diversity - too many repeats' });
    }

    score = Math.max(0, Math.min(100, score));

    if (score >= 60 && !dictWord && !isCommon && !isKeyboardWalk(pw) && pw.length >= 8) {
        feedback.push({ type: 'good', message: 'Good length and character variety' });
    }
    if (typesUsed === 4 && pw.length >= 16) {
        feedback.push({ type: 'good', message: 'Uses all character types' });
    }

    return {
        score: score,
        entropy: Math.round(entropy),
        crackTime: estimateCrackTime(entropy),
        feedback: feedback
    };
}

