import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS, IMAGE_ASSETS, AUDIO_ASSETS, SPRITESHEET_ASSETS, ANIMATION_FRAMES } from '../common/assets.js';
//import { ANIMATION_FRAMES } from '../common/animation-frames.js';


export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({
            key:SCENE_KEYS.PRELOAD_SCENE,
        });
    }

    preload() {

        IMAGE_ASSETS.forEach((asset) => {
            this.load.image(asset.assetKey, asset.path);
        });
        AUDIO_ASSETS.forEach((asset) => {
            this.load.audio(asset.assetKey, asset.path);
        });
        SPRITESHEET_ASSETS.forEach((asset) => {
            this.load.spritesheet(asset.assetKey, asset.path, {
                frameWidth: asset.frameWidth,
                frameHeight: asset.frameHeight,
            });
        });

    }

    
    create(){
        //console.log('preload-scene create called');
        SPRITESHEET_ASSETS.forEach((asset) => {
            this.anims.create({
                key: asset.assetKey,
                frames: this.anims.generateFrameNumbers(asset.assetKey),
                frameRate: asset.frameRate,
                repeat: asset.repeat,
            });
        });
        
        ANIMATION_FRAMES.forEach((anim) => {
            this.anims.create({
                key: anim.key,
                frames: this.anims.generateFrameNumbers(
                    anim.spritesheet,
                    {
                        start: anim.start,
                        end: anim.end
                    }
                ),
                frameRate: anim.frameRate,
                repeat: anim.repeat
            });
        });
        
        this.sound.play(ASSET_KEYS.BACKGROUND_MUSIC,{
            loop: true,
            volume: 0.75,
        });
        this.scene.start(SCENE_KEYS.TITLE_SCENE);
        //this.scene.start(SCENE_KEYS.GAME_SCENE);
    }
}