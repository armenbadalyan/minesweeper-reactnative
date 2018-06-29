require("babel-polyfill");
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


const DifficultyLevel = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    EXPERT: 'expert'
}

exports.addUserDetails = functions.auth.user()
    .onCreate(user => {
        const database = admin.firestore();

        return database.collection('user-profiles').doc(user.uid).set({
            displayName: user.displayName,
            photo: user.photoURL,
            uid: user.uid
        });
    });

exports.processCommand = functions.firestore
    .document('commands/{commandId}')
    .onCreate((snap) => {
        const command = snap.data();
        const commandType = command ? command.type : '';

        switch (commandType) {
            case 'SUBMIT_SCORE':
                processScore(command);
                break;
        }

    });


function processScore(scoreCommand) {
    const { payload, uid, payload: { score, difficulty, timestamp } } = scoreCommand;

    if (!payload || !uid) {
        return false;
    }

    if (score <= 0 && timestamp <= 0) {
        return false;
    }

    if (Object.values(DifficultyLevel).indexOf(difficulty) === -1) {
        return false;
    }

    const database = admin.firestore(),
        getUser = database.doc(`user-profiles/${uid}`).get(),
        getScore = database.doc(`scores/${uid}_${difficulty}`).get();


    Promise.all([getUser, getScore])
        .then(([userSnap, scoreSnap]) => {
            const userData = userSnap.data();
            const scoreData = scoreSnap.data();
            if (!scoreData || scoreData.score > score) {
                return database.doc(`scores/${uid}_${difficulty}`)
                    .set({
                        score,
                        uid,
                        difficulty,
                        timestamp,
                        user: userData
                    })
            }
            else {
                return true;
            }
        });
}