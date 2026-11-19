import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';
import { saveScore } from '../leaderboardService.js';

const DATA_KEYS = Object.freeze({
    ROTATION_SPEED:  'ROTATION_SPEED'
});

const textConfig = {
    fontSize: '32px',
    color: '#043D8C',
    stroke: '#ffffff',
    strokeThickness: 6,
};


export class GameEndScene extends Phaser.Scene {
    #score;
    constructor() {
        super({
            key:SCENE_KEYS.GAME_END_SCENE,
        });
    }

    init(data) {
        this.#score = data.score;
    }

    create(){
        this.cameras.main.setBackgroundColor('#000000');
        
        this.playerName = '';

        this.nameText = this.add.text(
            this.scale.width / 2,
            550,
            'Enter Name: ',
            {
                fontSize: '32px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        this.input.keyboard.on('keydown', async(event) => {
    
            if (event.key === 'Backspace') {
                this.playerName = this.playerName.slice(0, -1);
            }
            else if (event.key === 'Enter') {
                if (this.playerName.trim().length === 0) return;
                console.log('Player entered:', this.playerName);
                const saved = await saveScore(
                    this.playerName,
                    this.#score
                );

                if(saved){
                    console.log('Leaderboard updated!');
                }
            }
            else if (event.key.length === 1) {
                this.playerName += event.key;
            }
    
            this.nameText.setText('Enter Name: ' + this.playerName);
        });
    

        this.add.sprite(this.scale.width/4, this.scale.height/2, ASSET_KEYS.CAT_DANCE, 0).setScale(0.8).setDepth(1).play(ASSET_KEYS.CAT_DANCE);
        this.add.text(3*this.scale.width/4, 100, 'You survived!', textConfig, 
        ).setOrigin(0.5);
        this.add.text(3*this.scale.width/4, 200, `Score: ${this.#score}`, textConfig
        ).setOrigin(0.5);
        const button1 = this.add.text(
            3*this.scale.width/4 - 180, 350,
            'Click here to play again!',
            { fontSize: '22px', color: '#ffffff' }
        );
        button1.setInteractive();
        const button2 = this.add.text(
            3*this.scale.width/4 - 200, 450,
            'Click here to the title sceen!',
            { fontSize: '22px', color: '#ffffff' }
        );
        button2.setInteractive();

        button1.on('pointerdown', () => {
            this.cameras.main.fadeOut(500);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start(SCENE_KEYS.GAME_SCENE);
            });
        });

        button2.on('pointerdown', () => {
            this.cameras.main.fadeOut(500);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start(SCENE_KEYS.TITLE_SCENE);
            });
        });
        this.cameras.main.fadeIn(500);
    }
}
