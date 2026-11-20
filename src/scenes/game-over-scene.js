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

export class GameOverScene extends Phaser.Scene {
    #score;
    constructor() {
        super({
            key:SCENE_KEYS.GAME_OVER_SCENE,
        });
    }

    init(data) {
        this.#score = data.score;
    }

    create(){
        this.cameras.main.setBackgroundColor('#000000');
        this.playerName = '';
        this.submittedName = '';
        this.checkLeaderboard = '';
        
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
            } else if (event.key === 'Enter') {
                if (this.playerName.trim().length === 0) return;
                console.log('Player entered:', this.playerName);
                const saved = await saveScore(
                    this.playerName,
                    this.#score
                 );
        
                if(saved){
                    this.submittedName = this.playerName;
                    this.playerName = '';
                    this.nameText.setText('Enter Name: ' + this.playerName);
                    this.checkLeaderboard = this.add.text(
                        this.nameText.x,
                        this.nameText.y + this.nameText.displayHeight + 10,
                        `${this.submittedName} & score:${this.#score} submitted to leaderboard!`,
                        {
                            fontSize: '22px',
                            color: '#ffffff'
                        }
                    ).setOrigin(0.5);
                    this.add.text(
                        this.checkLeaderboard.x,
                        this.checkLeaderboard.y + this.checkLeaderboard.displayHeight + 10,
                        `Check the leaderboard tab to see if you cracked the top 10!`,
                        {
                            fontSize: '22px',
                            color: '#ffffff'
                        }
                    ).setOrigin(0.5);
                    console.log('Leaderboard updated!');
                }
            } else if (event.key.length === 1) {
                        this.playerName += event.key;
            }
            
            this.nameText.setText('Enter Name: ' + this.playerName);
        });

        
        this.add.sprite(this.scale.width/4, this.scale.height/2, ASSET_KEYS.SAD_CAT, 0).setScale(0.8).setDepth(1000).play(ASSET_KEYS.SAD_CAT);
        this.add.text(3*this.scale.width/4 -50, 100, 'Game Over', textConfig, 
        ).setOrigin(0.5).setDepth(1000);
        this.add.text(3*this.scale.width/4-50, 200, `Score: ${this.#score}`, textConfig
        ).setOrigin(0.5).setDepth(1000);
        const button1 = this.add.text(
            3*this.scale.width/4 - 250, 300,
            'Click here to play again!',
            { fontSize: '28px', color: '#ffffff' }
        );
        button1.setInteractive();
        const button2 = this.add.text(
            3*this.scale.width/4 - 300, 400,
            'Click here for the title screen!',
            { fontSize: '28px', color: '#ffffff' }
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