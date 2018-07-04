require("babel-polyfill");
const functions = require('firebase-functions');
const admin = require('firebase-admin');

const serviceAccount = require('./service-account.json');
const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG);

adminConfig.credential = admin.credential.cert(serviceAccount);
admin.initializeApp(adminConfig);

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
    .onCreate(async (snap, context) => {
        const command = snap.data();
        const commandType = command ? command.type : '';

        try {
            switch (commandType) {
                case 'SUBMIT_SCORE':
                    await processScore(command);
                    break;
                case 'UPDATE_PROFILE':
                    await processProfile(command);
                    break;
            }
        }
        catch (err) {
            console.log('Error processing command', err);
        }

        return admin.firestore().doc(`commands/${context.params.commandId}`).delete();
    });


function processScore(scoreCommand) {
    const { payload, uid, payload: { score, difficulty, timestamp } } = scoreCommand;

    if (!payload || !uid) {
        return Promise.reject();
    }

    if (score <= 0 && timestamp <= 0) {
        return Promise.reject();
    }

    if (Object.values(DifficultyLevel).indexOf(difficulty) === -1) {
        return Promise.reject();
    }

    const database = admin.firestore(),
        getUser = database.doc(`user-profiles/${uid}`).get(),
        getScore = database.doc(`scores/${uid}_${difficulty}`).get();


    return Promise.all([getUser, getScore])
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
                return Promise.reject();
            }
        });
}

function processProfile(updateProfileCommand) {
    const { payload, uid } = updateProfileCommand;

    const database = admin.firestore(),
        getUser = admin.auth().getUser(uid);
        
        return getUser.then(userRecord => {
            const updateProfile = database.collection('user-profiles').doc(uid).update({
                displayName: userRecord.displayName || '',
                photo: userRecord.photoURL || ''
            });

            const updateScores = database.collection('scores').where('uid', '==', uid)
                .get()
                .then(querySnapshot => {
                    let updates = [];

                    querySnapshot.forEach(documentSnapshot => {
                        updates.push(documentSnapshot.ref.update({
                            user: {
                                displayName: userRecord.displayName || '',
                                photo: userRecord.photoURL || ''
                            }
                        }));
                      });

                    return Promise.all(updates); 
                });

            return Promise.all([updateProfile, updateScores]);
        })     
}