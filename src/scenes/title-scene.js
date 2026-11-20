import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';

const DATA_KEYS = Object.freeze({
    ROTATION_SPEED:  'ROTATION_SPEED'
});

export class TitleScene extends Phaser.Scene {
    constructor() {
        super({
            key:SCENE_KEYS.TITLE_SCENE,
        });
    }

    create(){
        
        this.add.image(0,0, ASSET_KEYS.FARMER_LOGO, 0)
            .setOrigin(0)
            .setScale(0.5)
            .setAlpha(0.8);

        
        const start_button = this.add.image(this.scale.width/2,550, ASSET_KEYS.START_BUTTON, 0).setScale(0.1).setAlpha(0.8).setDepth(2000);
        const info_button = this.add.image(1000,50, ASSET_KEYS.INFO_BUTTON, 0).setScale(0.1).setAlpha(0.8).setDepth(2000);
        start_button.setInteractive();
        info_button.setInteractive();

        info_button.on('pointerdown', () => {
                    this.cameras.main.fadeOut(500);
                    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                        this.scene.start(SCENE_KEYS.INSTRUCTION_SCENE);
                    });
                });

        start_button.on('pointerdown', () => {
            this.cameras.main.fadeOut(500);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start(SCENE_KEYS.GAME_SCENE);
            });
        });

        this.cameras.main.fadeIn(500);
    }
}