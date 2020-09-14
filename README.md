# Mega Golf

Mega Gold is a competitive realtime multiplayer mini golf game. We made this game as part of our
capstone project for Fullstack Acadamy's fulltime web development bootcamp. This game was inspired
by many of the "io" games that exist on the internet like, [Agar.io](https://agar.io/), [slither.io](http://slither.io/), and [skirbbl.io](https://skribbl.io/).

While these games mostly depend on a web socket framework to share data between clients, we opted f
or Google Cloud Platform's [realtime database](https://firebase.google.com/docs/database). The realtime database allows the client to set up data
listeners, so instead of emitting socket events, we created listeners for data creation, deletion,
and changes.

Some of the other technologies we utlizied were [Planck.js](https://piqnt.com/planck.js/) to simulate the physics and [Phaser](https://phaser.io/) to
render the game to the client.
