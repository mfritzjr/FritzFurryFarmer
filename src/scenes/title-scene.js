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

        
        this.add.text(this.scale.width/2, 500, 'Click to play!', {
            fontSize: '22px',
        }).setOrigin(0.5).setDepth(1000);

        this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {
            this.cameras.main.fadeOut(500);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start(SCENE_KEYS.GAME_SCENE);
            });
        });

        this.cameras.main.fadeIn(500);
    }
}