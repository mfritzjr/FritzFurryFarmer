import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';

const DATA_KEYS = Object.freeze({
    ROTATION_SPEED:  'ROTATION_SPEED'
});

export class InstructionScene extends Phaser.Scene {
    constructor() {
        super({
            key:SCENE_KEYS.INSTRUCTION_SCENE,
        });
    }

    create(){
        
        this.add.image(0,0, ASSET_KEYS.INSTRUCTIONS, 0)
            .setOrigin(0,0)
            .setScale(0.5)
            .setAlpha(1)
            .setDisplaySize(this.scale.width, this.scale.height-50);
        
  

        const x_button = this.add.image(1000,50, ASSET_KEYS.X_BUTTON, 0).setScale(0.1).setAlpha(0.8).setDepth(2000);
        x_button.setInteractive();

        x_button.on('pointerdown', () => {
                    this.cameras.main.fadeOut(500);
                    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                        this.scene.start(SCENE_KEYS.TITLE_SCENE);
                    });
                });

        this.cameras.main.fadeIn(500);
    }
}