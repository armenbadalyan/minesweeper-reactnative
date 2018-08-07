require("babel-polyfill");
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const moment = require('moment');

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

const scopeStart = {
    daily: () => {
        return moment().utc().startOf('day').valueOf()
    },
    weekly: () => {
        return moment().utc().startOf('week').valueOf()
    },
    overall: () => {
        return 0
    }
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


async function processScore(scoreCommand) {
    const { payload, uid, payload: { score, difficulty } } = scoreCommand;

    if (!payload || !uid) {
        return Promise.reject('missing uid or payload');
    }

    if (score <= 0) {
        return Promise.reject('invalid score');
    }

    if (Object.values(DifficultyLevel).indexOf(difficulty) === -1) {
        return Promise.reject('invalid difficulty level provided');
    }

    let scopes = ['daily', 'weekly', 'overall'],
        checkNextScope = true;

    while (scopes.length && checkNextScope) {
        const scope = scopes.shift(),
            scoreSnapshot = await getScore(uid, difficulty, scope);


        if (scoreSnapshot) {
            if (scoreImproved(scoreSnapshot.data(), score, scope)) {
                updateScore(scoreSnapshot.id, uid, difficulty, score, Date.now(), scope);
            }
        }
        else {
            addScore(uid, difficulty, score, Date.now(), scope);
        }
    }


}

function getScore(uid, difficulty, scope) {
    const database = admin.firestore()
    return database.collection(`scores_${scope}`)
        .where('uid', '==', uid)
        .where('difficulty', '==', difficulty)
        .get()
        .then(snapshot => snapshot.empty ? null : snapshot.docs[0]);
}

function updateScore(scoreId, uid, difficulty, score, timestamp, scope) {
    const database = admin.firestore();

    return admin.auth().getUser(uid)
        .then(userRecord => {
            console.log(`updating ${difficulty} high score ${score} in ${scope} scope for user`, userRecord);

            return database.doc(`scores_${scope}/${scoreId}`)
                .set(buildScoreDocumentData(userRecord, difficulty, score, timestamp, scopeStart[scope]()));
        });
}

function addScore(uid, difficulty, score, timestamp, scope) {
    const database = admin.firestore();

    return admin.auth().getUser(uid)
        .then(userRecord => {
            console.log(`saving ${difficulty} new high score ${score} in ${scope} scope for user`, userRecord);

            return database.collection(`scores_${scope}`)
                .add(buildScoreDocumentData(userRecord, difficulty, score, timestamp, scopeStart[scope]()));
        });
}

function buildScoreDocumentData(user, difficulty, score, timestamp, period) {
    return {
        score,
        uid: user.uid,
        difficulty,
        timestamp,
        period: period,
        user: {
            displayName: user.displayName || '',
            photo: user.photoURL || '',
            uid: user.uid
        }
    }
}

function scoreImproved(prevScoreData, score, scope) {

    // prev  score was recorded before scope start date
    if (prevScoreData.timestamp < scopeStart[scope]()) {
        return true;
    }

    // new score is better than previous one
    if (prevScoreData.score > score) {
        return true;
    }

    return false;
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

        return Promise.all([updateProfile,
            updateProfileInScores(userRecord, 'daily'),
            updateProfileInScores(userRecord, 'weekly'),
            updateProfileInScores(userRecord, 'overall')]);
    })
}

function updateProfileInScores(userRecord, scope) {
    const database = admin.firestore();

    return database.collection(`scores_${scope}`).where('uid', '==', userRecord.uid)
        .get()
        .then(querySnapshot => {
            let updates = [];

            querySnapshot.forEach(documentSnapshot => {
                console.log(`updating displayName in score with scope ${scope}`, documentSnapshot);
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
}