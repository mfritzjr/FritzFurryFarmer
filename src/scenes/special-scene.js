import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS, IMAGE_ASSETS, AUDIO_ASSETS, SPRITESHEET_ASSETS } from '../common/assets.js';

export class SpecialScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENE_KEYS.SPECIAL_SCENE});
    }

    init(data) {
        this.upgrades = data;
    }

    create() {
        // Dark transparent overlay
        this.add.text(
            this.scale.width / 4 - 100,
            50,
            'You have grown the glorious Catnip:',
            {
                fontSize: '32px',
                color: '#ffffff'
            }
        ).setDepth(2000);
        const catnip =  this.add.image(this.scale.width/2, 150, ASSET_KEYS.CATNIP);
        catnip
            .setTexture(ASSET_KEYS.CATNIP)
            .setActive(true)
            .setVisible(true)
            .setDepth(2000)
            .setScale(0.1)
        this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.6
        );
        this.add.text(
            100,
            250,
            'Select one of the following skills for your evolution:',
            {
                fontSize: '24px',
                color: '#ffffff'
            }
        ).setDepth(2000);
        const button1 = this.add.text(
            100, 350,
            `${this.upgrades[0]}`,
            { fontSize: '28px', color: '#ffffff' }
        );
        button1.setInteractive();

        const button2 = this.add.text(
            375, 450,
            `${this.upgrades[1]}`,
            { fontSize: '28px', color: '#ffffff' }
        );
        button2.setInteractive();

        const button3 = this.add.text(
            700, 350,
            `${this.upgrades[2]}`,
            { fontSize: '28px',color: '#ffffff' }
        );
        button3.setInteractive();
    
        button1.on('pointerdown', () => {
            this.selectUpgrade(`${this.upgrades[0]}`);
        });
        button2.on('pointerdown', () => {
            this.selectUpgrade(`${this.upgrades[1]}`);
        });
        button3.on('pointerdown', () => {
            this.selectUpgrade(`${this.upgrades[2]}`);
        });
        // Resume button
        const skipButton = this.add.text(
            this.scale.width / 2,
            600,
            'Skip Upgrade',
            {
                fontSize: '32px',
                color: '#ffffff'
            }
        )
        .setOrigin(0.5)
        .setInteractive();

        skipButton.on('pointerdown', () => {
            this.scene.resume(SCENE_KEYS.GAME_SCENE);
            this.scene.stop();
        });
    }

    selectUpgrade(upgrade) {
        const gameScene = this.scene.get(SCENE_KEYS.GAME_SCENE);
    
        // Send selected upgrade to the game
        gameScene.applySpecialUpgrade(upgrade);
    
        // Resume gameplay
        this.scene.resume(SCENE_KEYS.GAME_SCENE);
    
        // Close the menu
        this.scene.stop();
    }
}