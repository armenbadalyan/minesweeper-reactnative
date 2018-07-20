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

exports.processCommand = functions.firestore
    .document('commands/{commandId}')
    .onCreate(async (snap, context) => {
        const command = snap.data();
        const commandType = command ? command.type : '';

        console.log('Incoming command: ', commandType, command);

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
        return Promise.reject('missing uid or payload');
    }

    if (score <= 0 && timestamp <= 0) {
        return Promise.reject('invalid score or timestamp');
    }

    if (Object.values(DifficultyLevel).indexOf(difficulty) === -1) {
        return Promise.reject('invalid difficulty level provided');
    }

    const database = admin.firestore(),
        getUser = admin.auth().getUser(uid),        
        getScore = database.doc(`scores/${uid}_${difficulty}`).get();


    return Promise.all([getUser, getScore])
        .then(([userRecord, scoreSnap]) => {            
            const scoreData = scoreSnap.data();
            if (!scoreData || scoreData.score > score) {
                console.log(`saving new high score ${score} for user`, userRecord);
                return database.doc(`scores/${uid}_${difficulty}`)
                    .set({
                        score,
                        uid,
                        difficulty,
                        timestamp,
                        user: {
                            displayName: userRecord.displayName || '',
                            photo: userRecord.photoURL || '',
                            uid: userRecord.uid
                        }
                    })
            }
            else {
                return Promise.reject('provided score is not the best');
            }
        });
}

function processProfile(updateProfileCommand) {
    const { payload, uid } = updateProfileCommand;

    const database = admin.firestore(),
        getUser = admin.auth().getUser(uid);
        
        return getUser.then(userRecord => {
            console.log('updating user profile ', userRecord);
            const updateProfile = database.collection('user-profiles').doc(uid).set({
                displayName: userRecord.displayName || '',
                photo: userRecord.photoURL || '',
                uid: userRecord.uid
            });

            const updateScores = database.collection('scores').where('uid', '==', uid)
                .get()
                .then(querySnapshot => {
                    let updates = [];

                    querySnapshot.forEach(documentSnapshot => {
                        console.log('updating displayName in score ', documentSnapshot);
                        updates.push(documentSnapshot.ref.update({
                            user: {
                                displayName: userRecord.displayName || '',
                                photo: userRecord.photoURL || '',
                                uid: userRecord.uid
                            }
                        }));
                      });

                    return Promise.all(updates); 
                });

            return Promise.all([updateProfile, updateScores]);
        })     
}