import './style.css';
import Phaser from 'phaser';

// uvoz scen
import UIScene from './scenes/UIScene';
import PreloadScene from './scenes/preloadScene';
import MenuScene from './scenes/menuScene';
import LabScene from './scenes/labScene';
import TestScene from './scenes/testScene';
import LoginScene from './scenes/loginScene';
import ScoreboardScene from './scenes/scoreboardScene';
import WorkspaceScene from './scenes/workspaceScene';

const config = {
    type: Phaser.AUTO,
    // fixed virtual resolution (change if you want another size)
    width: 1280,
    height: 720,
    backgroundColor: '#f4f6fa',
    parent: 'game-container',
    scene: [
        MenuScene,
        LabScene,
        WorkspaceScene,
        PreloadScene,
        UIScene,
        TestScene,
        LoginScene,
        ScoreboardScene
    ],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// inicializacija igre
const game = new Phaser.Game(config);
export default game;
