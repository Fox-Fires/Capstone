const functions = require('firebase-functions');
const admin = require('firebase-admin');

const app = admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorlds = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

exports.getPlayer = functions.https.onRequest((req,res)=>{
  admin.firestore().collection('Player').get()
    .then(data=>{
      let test = [];
      data.forEach(doc =>{
        test.push(doc.data());
      })
      return res.json(test);
    })
    .catch(err=>console.error(err))
})

exports.createPlayer = functions.https.onRequest((req,res)=>{
  if(req.method !=="POST"){
    return res.status(400).json({error: 'Method not allowed'});
  }
  const newPlayer = {
    x: req.body.x,
    y: req.body.y
  }
  admin.firestore()
    .collection('Player')
    .add(newPlayer)
    .then(doc =>{
      res.json({message: `document ${doc.id} created successfully`})
    })
    .catch(err=>{
      res.status(500).json({error: 'something went wrong'});
      console.error(err)
    })
})
