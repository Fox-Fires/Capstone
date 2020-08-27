const { Game } = require('./Game');

exports.config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  parent: 'physics',
  'dom.createContainer': true,
  backgroundColor: '#cccccc',
  scene: [Game],
};
