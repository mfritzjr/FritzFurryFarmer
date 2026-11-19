import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';

const textConfig = {
    fontSize: '32px',
    color: '#043D8C',
    stroke: '#ffffff',
    strokeThickness: 6,
};

export class GameScene extends Phaser.Scene {
    #farmer;
    #cursorKeys;
    #plantGroup;
    #timer;
    #moveSpeed;
    #farmerRangeContainer;
    #lastDirectionPressed;
    #score;
    #bulletGroup;
    #enemyGroup;
    #lastBulletFiredTime;
    #damage;
    #projectiles;
    #farmerHealth;
    #farmerHealthContainer;
    #farmerEmptyHealth;
    #difficulty;
    #spawnDelay;
    #healthRegen;
    #spawnTimer;
    #magnet;
    #pickupGroup;
    #bulletSpeed;
    #formerFarmerPosition;
    #plantCounter;
    #isInvulnerable;
    #maxHealth;
    #scoreText;
    #level;
    #levelText;
    #experience;
    #levelRequirement;
    #farmerLevel;
    #fireRate;
    #bulletSize;
    #defense;
    #magnetRadius;
    #oldRadius;
    #timerText;
    #priority;
    #specialList;
    #plantMult;
    #scoreMult;
    #specialFixed;
    #plantPositions;
    #nextTarget;
    #remainingCatnip;
    #gameEnd;
    #lockInput;
    #findingFarmer;
    #startTime;
    #bossSpawnTimer;




    constructor() {
        super({
            key:SCENE_KEYS.GAME_SCENE,
        });
    }

    init(){
        this.#farmerLevel = 1;
        this.#timer = 0;
        this.#moveSpeed = 5;
        this.lastDirectionPressed = 2;
        this.#difficulty = 0;
        this.#damage = 10;
        this.#farmerHealth = 8;
        this.#lastBulletFiredTime = 0;
        this.#bulletSpeed = 100;
        this.#plantCounter = 0;
        this.#isInvulnerable = false;
        this.#maxHealth = 8;
        this.#score = 0;
        this.#level = 1;
        this.#experience = 0;
        this.#levelRequirement = 50;
        this.#fireRate = 1500;
        this.#bulletSize = 0.2;
        this.#defense = 0;
        this.#magnet = 1;
        this.#magnetRadius = 50;
        this.#oldRadius = 50;
        this.#timer = 0;
        this.#priority = 0;
        this.#projectiles = 1;
        this.#specialList = [
            'Bullet Speed',
            'Health Regen',
            'Number of Projectiles',
            'Plant Score Multiplier',
            'Gem Score Multiplier',
        ];
        this.#healthRegen = 0;
        this.#plantMult = 1;
        this.#scoreMult = 1;
        this.#plantPositions = [
            {'x' : 315,'y' : 205},
            {'x' : 245,'y' : 205},
            {'x' : 315,'y' : 155},
            {'x' : 245,'y' : 155},
            {'x' : 795,'y' : 530},
            {'x' : 730,'y' : 530},
            {'x' : 795,'y' : 475},
            {'x' : 730,'y' : 475},
            {'x' : 315,'y' : 530},
            {'x' : 245,'y' : 530},
            {'x' : 315,'y' : 475},
            {'x' : 245,'y' : 475},
            {'x' : 795,'y' : 205},
            {'x' : 730,'y' : 205},
            {'x' : 795,'y' : 155},
            {'x' : 730,'y' : 155},
        ];
        this.#nextTarget = {'x' : 315,'y' : 530};
        this.#remainingCatnip = 5;
        this.#lockInput = false;
        this.#gameEnd = 0;
    }

    create(){
        //console.log('game-scene create called');
        //console.log(this.game.scene.keys);
        const {width, height} = this.scale;
        let plant = null;
        this.#startTime = this.time.now;

        this.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND_1).setScale(1.75);
        this.#farmer = this.physics.add.sprite(this.scale.width/2, this.scale.height/2, ASSET_KEYS.FARMER1_D, 0).setScale(0.4).setDepth(1).play(ASSET_KEYS.FARMER1_D);
        this.#farmer.setBodySize(200,300, (this.#farmer.width - 200) / 2, (this.#farmer.height - 300) / 2);
        this.#magnet = this.add.circle(this.#farmer.x, this.#farmer.y,50).setActive(true);
        this.physics.add.existing(this.#magnet);
        this.#magnet.body.setCircle(this.#magnetRadius, 0 ,0);
        this.#farmerRangeContainer = this.add.container([this.#farmer, this.#magnet]);

        this.#cursorKeys = this.input.keyboard.createCursorKeys();
        this.#plantGroup = this.physics.add.group({});
        this.#bulletGroup = this.physics.add.group({});


        this.#createPlants();
        
        this.#farmerEmptyHealth = this.add.container(
            50,
            50,
            Array.from({length:this.#maxHealth},(_,i) =>
                this.add.image(i * 50, 0 , ASSET_KEYS.EMPTY_HEART).setScale(0.04)
            )
        );
        this.#farmerHealthContainer = this.add.container(
            50,
            50,
            Array.from({length:this.#maxHealth},(_,i) =>
                this.add.sprite(i * 50, 0 , ASSET_KEYS.HEART,0).play(ASSET_KEYS.HEART).setScale(0.08)
            )
        );
        this.#farmerEmptyHealth.setDepth(999);
        this.#farmerHealthContainer.setDepth(1000);
        this.#enemyGroup = this.physics.add.group({});
        this.#pickupGroup = this.physics.add.group({});
        this.#spawnDelay = 2000;
        this.#lastBulletFiredTime = 0;
        this.#formerFarmerPosition = {
            x: this.scale.width/2,
            y: this.scale.height/2
        };
        
        
        this.#spawnTimer = this.time.addEvent({
            delay: this.#spawnDelay,
            callback: this.#spawnEnemy,
            callbackScope: this,
            loop: true
        });
        
        this.time.addEvent({
            delay: 5000,
            callback:this.#spawnSpeed,
            callbackScope: this,
            loop:true
        });
        
        this.#findingFarmer = this.time.addEvent({
            delay:250,
            callback:this.#findFarmer,
            callbackScope:this,
            loop:true
        });
        
        this.#bossSpawnTimer = this.time.addEvent({
            delay: 30000,
            callback:this.#bossSpawn,
            callbackScope:this,
            loop:true
        });

        this.time.addEvent({
            delay: 10000,
            callback:this.#regen,
            callbackScope:this,
            loop:true
        });
        
        this.physics.add.overlap(this.#bulletGroup, this.#enemyGroup, this.#handleBulletAndEnemyCollision, undefined, this);
        //this.physics.add.overlap(this.#farmer, this.#pickupGroup, this.#handlePickups, undefined,this);
        this.physics.add.overlap(this.#bulletGroup, this.#plantGroup, this.#handleBulletAndPlantCollision, undefined, this);
        this.physics.add.overlap(this.#farmer, this.#enemyGroup, this.#handleFarmerAndEnemyCollision,undefined,this);
        this.physics.add.overlap(this.#magnet, this.#pickupGroup, this.#handlePickups,undefined,this);
        const scoreTextPrefix = this.add.text(this.scale.width - 300, 80,'Score:', textConfig).setDepth(1000);
        this.#scoreText = this.add.text(scoreTextPrefix.x + scoreTextPrefix.displayWidth,scoreTextPrefix.y,` ${this.#score} `, textConfig).setDepth(1000);

        const levelTextPrefix = this.add.text(50, 80,'Level:', textConfig).setDepth(1000);
        this.#levelText = this.add.text(levelTextPrefix.x + levelTextPrefix.displayWidth,levelTextPrefix.y,` ${this.#level} `, textConfig).setDepth(1000);
        this.#timerText = this.add.text(this.scale.width/2 - 60, 80, '0:00', textConfig).setDepth(1000);
    }

    update(time,delta){
        if(this.#lockInput){
            return;
        }
        const elapsedTime = this.time.now - this.#startTime;
        const totalSeconds = Math.floor(elapsedTime / 1000);
  
        // Calculate minutes and remaining seconds
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        // Pad both numbers with a leading zero if they are under 10
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');
        
        this.#timerText.setText(`${formattedMinutes}:${formattedSeconds}`).setDepth(1000);
        if(elapsedTime >= 150000){
            //console.log('Enemies are supposed to stop spawning');
            this.#spawnTimer.destroy();
            this.#bossSpawnTimer.destroy();
            
        }
        if(elapsedTime >= 165000){
            if(this.#gameEnd === 0){
                this.#end();
                this.#gameEnd +=1;
            }
            
        }

        if(this.#cursorKeys.left.isDown){
            if(this.#lastDirectionPressed !== 0){
                this.#farmer.setTexture(ASSET_KEYS[`FARMER${this.#farmerLevel}_L`]).play(ASSET_KEYS[`FARMER${this.#farmerLevel}_L`]);
            }
            this.#farmer.x -= this.#moveSpeed;
            this.#lastDirectionPressed = 0;
            this.#magnet.x = this.#farmer.x;
        } else if(this.#cursorKeys.right.isDown){
            if(this.#lastDirectionPressed !== 1){
                this.#farmer.setTexture(ASSET_KEYS[`FARMER${this.#farmerLevel}_R`]).play(ASSET_KEYS[`FARMER${this.#farmerLevel}_R`]);
            }
            this.#farmer.x += this.#moveSpeed;
            this.#lastDirectionPressed = 1;
            this.#magnet.x = this.#farmer.x;
        } else if(this.#cursorKeys.down.isDown){
            if(this.#lastDirectionPressed !== 2){
                this.#farmer.setTexture(ASSET_KEYS[`FARMER${this.#farmerLevel}_D`]).play(ASSET_KEYS[`FARMER${this.#farmerLevel}_D`]);
            }
            this.#farmer.y += this.#moveSpeed;
            this.#lastDirectionPressed = 2;
            this.#magnet.y = this.#farmer.y;
        } else if(this.#cursorKeys.up.isDown){
            this.#farmer.y -= this.#moveSpeed;
            this.#magnet.y = this.#farmer.y;
        }

        if(this.#farmer.body.x  < 0){
            this.#farmer.body.x = 0;
        } else if(this.#farmer.body.x + this.#farmer.body.width > this.scale.width) {
            this.#farmer.body.x  = this.scale.width - this.#farmer.body.width;
        } else if(this.#farmer.body.y  < 0){
            this.#farmer.body.y = 0;
        } else if(this.#farmer.body.y + this.#farmer.body.height > this.scale.height){
            this.#farmer.body.y = this.scale.height - this.#farmer.body.height;
        }

        if(this.#lastBulletFiredTime === 0){
            this.#plantCheck();
        }
        this.#enemyCheckPosition();
        
        //const pointer = this.input.activePointer;
        this.#chooseNextTarget();
        if(time > this.#lastBulletFiredTime + this.#fireRate){
            //if(pointer.leftButtonDown()){
            //this.#fireBullet(pointer.worldX,pointer.worldY);
            //}
            
            this.#fireBullet();
            this.#lastBulletFiredTime = time;
        }
        
        
        this.#bulletGroup.getChildren().forEach((bullet) => {
            if(bullet.active && (bullet.x < 0 || bullet.x > this.scale.width || bullet.y < 0 || bullet.y > this.scale.height)){
                bullet.data.reset();
                bullet.disableBody();
                bullet.setActive(false).setVisible(false);
            }
        })  
        
        
    }


    #createPlants(){
        let plant = null;
        const length = this.#plantPositions.length;
        for(let i = 0;i < length; i++){
            plant = this.#plantGroup.getFirstDead(true,this.#plantPositions[i].x, this.#plantPositions[i].y,ASSET_KEYS.PLANT,0, true);
            plant
                .setTexture(ASSET_KEYS.PLANT,0)
                .setScale(0.4)
                .setActive(true)
                .setVisible(true)
                .enableBody()
                .setData({'watered': 0});
            if(((i+1) % 1) == 0 ){
                plant.setDepth(5);
            }else if((i+1 % 2) == 0){
                plant.setDepth(5);
            }
            plant.setBodySize(150,120,true);
        }
    }

    #chooseNextTarget(){
        let nearestPlant = this.#nearestPlant(this.#farmer.body, this.#plantGroup);
        let nearestEnemy = this.#findNearestEnemy(this.#farmer.body, this.#enemyGroup);
        let distancePlant = Infinity;
        let distanceEnemy = Infinity;
        if(nearestPlant !== null){
            distancePlant = this.#distanceFunction(this.#farmer.x,this.#farmer.y,nearestPlant.x,nearestPlant.y);
            //console.log('the nearest plant is',nearestPlant ,' + ', distancePlant);
        }
        if(nearestEnemy !== null){
            distanceEnemy = this.#distanceFunction(this.#farmer.x,this.#farmer.y,nearestEnemy.x,nearestEnemy.y);
            //console.log('the nearest enemy is',nearestEnemy ,' + ', distanceEnemy);
            if(nearestPlant == null){
                this.#nextTarget = nearestEnemy;
                return;
            }
            if(nearestEnemy != null && nearestPlant != null){
                //console.log('comparing the two distances', nearestEnemy, ' ', nearestPlant);
                if(distanceEnemy < distancePlant + 100){
                    //console.log('original nearest enemy =', this.#nextTarget);
                    
                    this.#nextTarget = nearestEnemy;
                    //console.log('new nearest enemy =', this.#nextTarget);
                }
                else{
                    //console.log('original nearest =', this.#nextTarget);
                    this.#nextTarget = nearestPlant;
                    //console.log('new nearest plant =', this.#nextTarget);
                }
            
            }
        } else if(nearestPlant !== null){
            //console.log('Plant is alive and no enemies');
            //console.log('the nearest plant is',nearestPlant ,' + ', distancePlant);
            this.#nextTarget = nearestPlant;
        } else if(nearestPlant == null ){
            //console.log('Somehow both are null again');
            return;
        }
    }

    #fireBullet(){
        
        let left = this.#nextTarget.x <= this.#farmer.x;
        
        let bullet = null;
        for(let i = 0; i < this.#projectiles; i++){
            if(left){
                bullet = this.#bulletGroup.getFirstDead(true,this.#farmer.x - this.#farmer.body.width/2, this.#farmer.body.y +(this.#farmer.body.height/2) +(20 * i),ASSET_KEYS.WATER_BULLET,0, true);
            } else{
                bullet = this.#bulletGroup.getFirstDead(true,this.#farmer.x + this.#farmer.body.width/2, this.#farmer.body.y +(this.#farmer.body.height/2) +(20 * i),ASSET_KEYS.WATER_BULLET,0, true);
            }
            
            //bullet.setActive(true).setVisible(true).setScale(0.5).play(ASSET_KEYS.WATER_BULLET).enableBody();
            
    
            //this.add.sprite(x,y,ASSET_KEYS.WATER_BULLET,0).setScale(0.5).play(ASSET_KEYS.WATER_BULLET);
            //this.physics.moveTo(bullet,x,y,this.#bulletSpeed);
            bullet
                .setTexture(ASSET_KEYS.WATER_BULLET,0)
                .setScale(this.#bulletSize)
                .setActive(true)
                .setVisible(true)
                .enableBody()
                .play(ASSET_KEYS.WATER_BULLET)
                .setData({'HitEnemies': new Set(), 'HitPlants': new Set()});
            if(left)
            {
                bullet.setFlipX(true);
                bullet.body.setCircle(bullet.displayWidth*1, 0, 15);
            } else{
                bullet.body.setCircle(bullet.displayWidth*1, 75, 15);
            }
            this.physics.moveTo(bullet,this.#nextTarget.x ,this.#nextTarget.y +(20 * i),this.#bulletSpeed);
            
        }
        
    }
    
    #distanceFunction(a,b,x,y){
        const distance = Phaser.Math.Distance.Between(
            a,
            b,
            x,
            y
        );
        return distance;
    }

    #nearestPlant(farmer, plants){
        let nearest = null;
        let shortestDistance = Infinity;
        let distance = Infinity;
        plants.getMatching('active', true).forEach(plant => {
            distance = this.#distanceFunction(farmer.x,farmer.y,plant.x,plant.y);
            //console.log(farmer.x,farmer.y,plant.x,plant.y);
            //console.log('Checking distance of plant', distance, plant);
            //console.log('Checking distance of plant', i, ' and distance is ', distance, 'nearest is :', nearest);
            if(distance < shortestDistance){
                shortestDistance = distance;
                nearest = plant;
            }
        });
        return nearest;
    }

    #findNearestEnemy(farmer, enemies){
        let nearest = null;
        let shortestDistance = Infinity;
        let distance = Infinity;
        enemies.getMatching('active', true).forEach((enemy) => {
            distance = this.#distanceFunction(farmer.x,farmer.y,enemy.x,enemy.y);
            //console.log(farmer.x,farmer.y,enemy.x,enemy.y);
            //console.log('Checking distance of Enemy', distance, enemy);
            if(distance < shortestDistance){
                shortestDistance = distance;
                nearest = enemy;
            }
        });
        
        return nearest;
    }

    #spawnEnemy(){
        let x = 0;
        let y = 0;
        let enemyType = 0;
        let enemy = null;
        const edge = Phaser.Math.Between(0,3);
        if(edge === 0){
            x = 0;
            y = Phaser.Math.Between(0,this.scale.height);
        } else if(edge === 1){
            x = this.scale.width;
            y = Phaser.Math.Between(0,this.scale.height);
        } else if(edge === 2){
            x = Phaser.Math.Between(0, this.scale.width);
            y = 0;
        } else{
            x = Phaser.Math.Between(0, this.scale.width);
            y = this.scale.height;
        }

        if(this.#difficulty >= 2){
            enemyType = Phaser.Math.Between(0,2);
        }
        else{
            enemyType = this.#difficulty;
        }

        if(enemyType === 0){
            //if(x < this.#farmer.body.x){
            enemy = this.#enemyGroup.getFirstDead(true,x,y, ASSET_KEYS.ZOMBIE_CAT_R);
            //}
            //else{
                //enemy = this.#enemyGroup.getFirstDead(true,x,y, ASSET_KEYS.ZOMBIE_CAT_L);
            //}
            
            enemy
                .setTexture(ASSET_KEYS.ZOMBIE_CAT_R)
                .setActive(true)
                .setVisible(true)
                .enableBody()
                .setScale(Phaser.Math.FloatBetween(0.10, 0.15))
                .setData({'Health': 20, 'Speed': 25, 'Damage': 2, 'isBoss': false});
            enemy.body.reset(x,y);
            enemy.setBodySize(650,550,true);
            this.physics.moveTo(enemy, this.#formerFarmerPosition.x, this.#formerFarmerPosition.y, enemy.getData('Speed'));
        } else if(enemyType === 1){
            enemy = this.#enemyGroup.getFirstDead(true,x,y, ASSET_KEYS.MICE_R);
            
            enemy
                .setTexture(ASSET_KEYS.MICE_R)
                .setActive(true)
                .setVisible(true)
                .enableBody()
                .setScale(Phaser.Math.FloatBetween(0.1, 0.15))
                .setData({ 'Health': 10, 'Speed': 50, 'Damage':1, 'isBoss': false});
            enemy.body.reset(x,y);
            enemy.setBodySize(650,550,true);
            this.physics.moveTo(enemy, this.#formerFarmerPosition.x, this.#formerFarmerPosition.y, enemy.getData('Speed'));
        } else {
            enemy = this.#enemyGroup.getFirstDead(true,x,y, ASSET_KEYS.DOG_R);
            enemy
                .setTexture(ASSET_KEYS.DOG_R)
                .setActive(true)
                .setVisible(true)
                .enableBody()
                .setScale(Phaser.Math.FloatBetween(0.1, 0.15))
                .setData({'Health': 30, 'Speed': 40, 'Damage': 3, 'isBoss': false});
            enemy.body.reset(x,y);
            enemy.setBodySize(1000,900,true);
            this.physics.moveTo(enemy, this.#formerFarmerPosition.x, this.#formerFarmerPosition.y, enemy.getData('Speed'));
        }
    }

    #spawnSpeed(){
        if(this.#spawnDelay > 150) {
            this.#spawnDelay -= 50;
            //console.log('Spawn delay decreased to: ', this.#spawnDelay);
            this.#spawnTimer?.remove();
            this.#spawnTimer.destroy();
            this.#spawnTimer = this.time.addEvent({
                delay: this.#spawnDelay,
                callback: this.#spawnEnemy,
                callbackScope: this,
                loop: true
            });
        }
    }



    
    #bossSpawn(){
        let enemy = null;
        let x = 0;
        let y = 0;
        const edge = Phaser.Math.Between(0,3);
        if(edge === 0){
            x = 0;
            y = Phaser.Math.Between(0,this.scale.height);
        } else if(edge === 1){
            x = this.scale.width;
            y = Phaser.Math.Between(0,this.scale.height);
        } else if(edge === 2){
            x = Phaser.Math.Between(0, this.scale.width);
            y = 0;
        } else{
            x = Phaser.Math.Between(0, this.scale.width);
            y = this.scale.height;
        }
        if(this.#difficulty === 0){
            
            enemy = this.#enemyGroup.getFirstDead(true,x,y, ASSET_KEYS.ZOMBIE_CAT_R);
            
            enemy
                .setTexture(ASSET_KEYS.ZOMBIE_CAT_R)
                .setActive(true)
                .setVisible(true)
                .enableBody()
                .setScale(Phaser.Math.FloatBetween(0.3, 0.65))
                .setData({'Health': 120, 'Speed': 15, 'Damage': 3 - this.#defense, 'isBoss' : true});
            enemy.body.reset(x,y);
            enemy.body.setSize(650,650,true);
            this.physics.moveTo(enemy, this.#formerFarmerPosition.x, this.#formerFarmerPosition.y, enemy.getData('Speed'));
        } else if(this.#difficulty === 1){
            
            enemy = this.#enemyGroup.getFirstDead(true,x,y, ASSET_KEYS.MICE_R);
            
            enemy
                .setTexture(ASSET_KEYS.MICE_R)
                .setActive(true)
                .setVisible(true)
                .enableBody()
                .setScale(Phaser.Math.FloatBetween(0.3, 0.65))
                .setData({'Health': 80, 'Speed': 25, 'Damage': 2 - this.#defense, 'isBoss' : true});
            enemy.body.reset(x,y);
            enemy.body.setSize(650,650,true);
            this.physics.moveTo(enemy, this.#formerFarmerPosition.x, this.#formerFarmerPosition.y, enemy.getData('Speed'));
        } else if(this.#difficulty){
            
            enemy = this.#enemyGroup.getFirstDead(true,x,y, ASSET_KEYS.DOG_R);
            
            enemy
                .setTexture(ASSET_KEYS.DOG_R)
                .setActive(true)
                .setVisible(true)
                .enableBody()
                .setScale(Phaser.Math.FloatBetween(0.3, 0.65))
                .setData({'Health': 150, 'Speed': 20, 'Damage': 4 - this.#defense, 'isBoss' : true});
            enemy.body.reset(x,y);
            enemy.body.setSize(1000,850,true);
            this.physics.moveTo(enemy, this.#formerFarmerPosition.x, this.#formerFarmerPosition.y, enemy.getData('Speed'));
        }
        this.#difficulty += 1;
    }
    
    #findFarmer(){
        this.#formerFarmerPosition = {
            x: this.#farmer.body.x,
            y: this.#farmer.body.y
        };
    }

    

    #handleBulletAndPlantCollision(bullet,plant){
        if(bullet.getData('HitPlants').has(plant)){
            return;
        }
        bullet.getData('HitPlants').add(plant);
        
        if(plant.getData('watered') >= 4)
        {
            this.sound.play(ASSET_KEYS.FX_PLANT,{
                volume: 0.1,
            });
            const x = plant.x;
            const y = plant.y;
            const currentFrame = Number(plant.frame.name);
            plant.setTexture(ASSET_KEYS.PLANT, currentFrame + 1);
            this.#plantCounter += 1;
            //console.log(this.#plantCounter, 'is plant counter and score = ');
            this.#score += 250 * this.#plantMult;
            this.#scoreText.setText(`${this.#score}`);
            //console.log('and the new score is ', this.#score);
            
            this.time.delayedCall(1000, () => {
                if (plant.active) {
                    plant.setActive(false).setVisible(false);
                    plant.destroy();
                    
                }
            });

            if(this.#plantCounter == 4)
            {
                if(this.#remainingCatnip > 0){
                    this.#dropCatnip(x,y);
                    this.#remainingCatnip -= 1; 
                }
                this.#plantCounter = 0;
            }
            
            
        }
        else
        {
            this.sound.play(ASSET_KEYS.FX_PLANT,{
                volume: 0.05,
            });
            plant.setData({'watered': (plant.getData('watered') + 1)});
            const currentFrame = Number(plant.frame.name);
            plant.setTexture(ASSET_KEYS.PLANT, currentFrame + 1);
            this.time.delayedCall(500, () => {
                plant.setTexture(ASSET_KEYS.PLANT, currentFrame + 2);
            });
            
        }
    }

    
    #handleBulletAndEnemyCollision(bullet,enemy){
        if(bullet.getData('HitEnemies').has(enemy)){
            return;
        }
        this.sound.play(ASSET_KEYS.FX_HIT,{
            volume: 0.1,
        });
        const newHealth = enemy.getData('Health') - this.#damage;
        //console.log('old Health = ', enemy.getData('Health'))
        
        if(newHealth <= 0){
            const isBoss = enemy.getData('isBoss');
            const damage = enemy.getData('Damage');
            const x = enemy.x;
            const y = enemy.y;
            enemy.disableBody();
            enemy.data.reset();
            enemy.setActive(false).setVisible(false);
            //console.log('Enemy killed his stats were isBoss : ', isBoss, ' Damage : ', damage, ' and x,y : ', x, y);
            this.#dropPickups(isBoss,damage,x,y);
        } else {
            enemy.setData({'Health': newHealth});
            bullet.getData('HitEnemies').add(enemy);
        }
    }
    
    #dropPickups(isBoss, damage,x,y){
        let random = 0;
        if(isBoss){
            const purpleGem =  this.#pickupGroup.getFirstDead(true, x, y , ASSET_KEYS.PURPLE_GEM, 0, true);
            
            purpleGem
                .setTexture(ASSET_KEYS.PURPLE_GEM)
                .enableBody(true,x,y,true,true)
                .setScale(0.03)
                .setDepth(0)
                .setData({'Score': 250, 'Heal': 0 , 'SpecialLV': 0});
            purpleGem.body.reset(x,y);
            purpleGem.body.setSize(850, 850);
        }else if (damage === 2){
            random = Phaser.Math.Between(1,100);
            if(random === 100){
                const redGem =  this.#pickupGroup.getFirstDead(true, x, y , ASSET_KEYS.RED_GEM, 0, true);
                
                redGem
                    .setTexture(ASSET_KEYS.RED_GEM)
                    .enableBody(true,x,y,true,true)
                    .setScale(0.03)
                    .setDepth(0)
                    .setData({'Score': 50, 'Heal': 0 , 'SpecialLV': 0});
                redGem.body.reset(x,y);
                redGem.body.setSize(850, 850);
            } else if (random >= 80){
                
            } else if(random >= 70){
                const fish = this.#pickupGroup.getFirstDead(true, x, y , ASSET_KEYS.FISH, 0, true);
                
                fish
                    .setTexture(ASSET_KEYS.FISH)
                    .enableBody(true,x,y,true,true)
                    .setScale(0.03)
                    .setDepth(0)
                    .setData({'Score': 0, 'Heal': 1 , 'SpecialLV': 0});
                fish.body.reset(x,y);
                fish.body.setSize(850, 850);
            } else if(random >= 50){
                const greenGem =  this.#pickupGroup.getFirstDead(true, x, y , ASSET_KEYS.GREEN_GEM, 0, true);
                
                greenGem
                    .setTexture(ASSET_KEYS.GREEN_GEM)
                    .enableBody(true,x,y,true,true)
                    .setScale(0.03)
                    .setDepth(0)
                    .setData({'Score': 20, 'Heal': 0 , 'SpecialLV': 0});
                greenGem.body.reset(x,y);
                greenGem.body.setSize(850, 850);
            } else {
                const blueGem =  this.#pickupGroup.getFirstDead(true, x, y , ASSET_KEYS.BLUE_GEM, 0, true);
                
                blueGem
                    .setTexture(ASSET_KEYS.BLUE_GEM)
                    .enableBody(true,x,y,true,true)
                    .setScale(0.03)
                    .setDepth(0)
                    .setData({'Score': 10, 'Heal': 0 , 'SpecialLV': 0});
                blueGem.body.reset(x,y);
                blueGem.body.setSize(850, 850);
            }
        } else {
            random = Phaser.Math.Between(1,100);
            if(random >= 80){
                const redGem =  this.#pickupGroup.getFirstDead(true, x, y , ASSET_KEYS.RED_GEM, 0, true);
                
                redGem
                    .setTexture(ASSET_KEYS.RED_GEM)
                    .enableBody(true,x,y,true,true)
                    .setScale(0.03)
                    .setDepth(0)
                    .setData({'Score': 50, 'Heal': 0 , 'SpecialLV': 0});
                redGem.body.reset(x,y);
                redGem.body.setSize(850, 850);
            } else if(random >= 60){
                const fish =  this.#pickupGroup.getFirstDead(true, x, y , ASSET_KEYS.FISH, 0, true);
                
                fish
                    .setTexture(ASSET_KEYS.FISH)
                    .enableBody(true,x,y,true,true)
                    .setScale(0.03)
                    .setDepth(0)
                    .setData({'Score': 0, 'Heal': 1 , 'SpecialLV': 0});
                fish.body.reset(x,y);
                fish.body.setSize(850, 850);
            } else if(random >= 20){
                const greenGem =  this.#pickupGroup.getFirstDead(true, x, y , ASSET_KEYS.GREEN_GEM, 0, true);
    
                greenGem
                    .setTexture(ASSET_KEYS.GREEN_GEM)
                    .enableBody(true,x,y,true,true)
                    .setScale(0.03)
                    .setDepth(0)
                    .setData({'Score': 20, 'Heal': 0 , 'SpecialLV': 0});
                greenGem.body.reset(x,y);
                greenGem.body.setSize(850, 850);
            } else {
                const blueGem =  this.#pickupGroup.getFirstDead(true, x, y , ASSET_KEYS.BLUE_GEM, 0, true);
                
                blueGem
                    .setTexture(ASSET_KEYS.BLUE_GEM)
                    .enableBody(true,x,y,true,true)
                    .setScale(0.03)
                    .setDepth(0)
                    .setData({'Score': 10, 'Heal': 0 , 'SpecialLV': 0});
                blueGem.body.reset(x,y);
                blueGem.body.setSize(850, 850);
            }
        }
        
        
    }
    
    #handleFarmerAndEnemyCollision(farmer,enemy){
        let previousHealth = this.#farmerHealth;
        // 1. Ignore the hit if currently invulnerable
        if (this.#isInvulnerable) {
            return;
        }


        // 2. Apply damage and activate invulnerability
        this.#isInvulnerable = true;
        this.#farmerHealth -= enemy.getData('Damage');

        // Optional: Visual feedback (reduce opacity)
        this.#farmer.setAlpha(0.5);
        this.cameras.main.shake(150, 0.02);
        this.sound.play(ASSET_KEYS.FX_MINUS_HEALTH,{
            volume: 0.25,
        });

        if(this.#farmerHealth >= 0){
            for(let i = previousHealth - 1; i >= this.#farmerHealth; i--){
                this.#farmerHealthContainer.getAt(i).setVisible(false);
            }
        }
        
        
        // 3. Reset invulnerability after 500 ms
        this.time.delayedCall(1000, () => {
            this.#isInvulnerable = false;
            this.#farmer.setAlpha(1); // Restore normal appearance
        });

        if(this.#farmerHealth <= 0){
            this.#farmerHealthContainer.setVisible(false);
            //console.log('Game is Over!');
            
            //console.log('game is over!');
            this.#lockInput = true;
            this.#findingFarmer.destroy();
            this.#farmer.disableBody();
            this.#farmer.setActive(false).setVisible(false);
            this.#farmer.destroy();
            this.#magnet.destroy();
            this.#gameOver();

            //this.cameras.main.fadeOut(500);
            //this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            //    this.scene.start(SCENE_KEYS.GAME_OVER_SCENE, {score: this.#score});
            //});
            
        }
        
    }
    
    #dropCatnip(x,y){
        const catnip =  this.#pickupGroup.getFirstDead(true, x, y , ASSET_KEYS.CATNIP, 0, true);
        catnip
            .setTexture(ASSET_KEYS.CATNIP)
            .setActive(true)
            .setVisible(true)
            .enableBody()
            .setScale(0.05)
            .setData({'Score': 0, 'Heal': 0 , 'SpecialLV': 1});
        catnip.body.reset(x,y);
        catnip.body.setSize(800,800);
    }
    
    #specialLevelUp(){
        if(this.#farmerLevel < 5){
            this.#farmerLevel += 1;
        }
        
        let upgrades = null;
        Phaser.Math.RND.shuffle(this.#specialList);
        upgrades = this.#specialList.slice(0,3);
        //console.log(upgrades);
        this.#farmer.setTexture(ASSET_KEYS[`FARMER${this.#farmerLevel}_D`]).play(ASSET_KEYS[`FARMER${this.#farmerLevel}_D`]);
        this.scene.launch(SCENE_KEYS.SPECIAL_SCENE, upgrades);
        this.scene.pause();
    }
    
    #levelUp(){
        this.#experience = this.#experience % this.#levelRequirement;
        this.#levelRequirement *= 1.5;
        this.#level += 1;
        this.#levelText.setText(` ${this.#level}`);
        this.sound.play(ASSET_KEYS.FX_LEVELUP,{
            volume: 0.2,
        });
        this.#showUpgradeMenu();

    }

    #showUpgradeMenu() {
        const upgradeList = [
            'Increase Fire Rate',
            'Faster Walk Speed',
            'Increase Attack Power',
            'Magnet Effect',
            'Increase Defense',
            'Lower Spawn Speed',
            'Increase Total Health',
            'Increase Bullet Size'
        ];

        Phaser.Math.RND.shuffle(upgradeList);
        const upgrades = upgradeList.slice(0,3);
        //console.log(upgrades);
        this.scene.launch(SCENE_KEYS.UPGRADE_SCENE, upgrades);
        this.scene.pause();
        
    }
    
    #handlePickups(farmer,item){
        
        const score = item.getData('Score');
        const health = item.getData('Heal');
        const specialLvl = item.getData('SpecialLV');
        
        if(score > 0){
            this.sound.play(ASSET_KEYS.FX_GEM,{
                volume: 0.2,
            });
            this.#score += score *this.#scoreMult;
            this.#experience += score *this.#scoreMult;
            if(this.#experience/this.#levelRequirement > 1){
                this.#levelUp();
            }
            //console.log('new score = ', this.#score);
            item.disableBody();
            item.data.reset();
            item.setActive(false).setVisible(false);
            this.#scoreText.setText(` ${this.#score} `);
        }else if(health > 0){
            this.sound.play(ASSET_KEYS.FX_FOOD,{
                volume: 0.2,
            });
            if(this.#farmerHealth + health > this.#maxHealth)
            {
                //console.log('1. Farmer already has max health, current Health = ', this.#farmerHealth)
                this.#farmerHealth = this.#maxHealth;
                //console.log('2. Farmer already has max health, current Health = ', this.#farmerHealth)
            } else{
                this.#farmerHealthContainer.getAt(this.#farmerHealth).setVisible(true);
                this.#farmerHealth += health;
            }
            item.disableBody();
            item.data.reset();
            item.setActive(false).setVisible(false);
        } else if (specialLvl > 0){
            this.sound.play(ASSET_KEYS.FX_FOOD,{
                volume: 0.2,
            });
            this.#specialLevelUp();
            
            item.disableBody();
            item.data.reset();
            item.setActive(false).setVisible(false);

        }

    }
    
    applyUpgrade(upgrade){
        switch (upgrade) {
            case 'Increase Fire Rate':
                this.#fireRate *= 0.8;
                break;
            case 'Faster Walk Speed':
                this.#moveSpeed += 2.5;
                break;
            case 'Increase Attack Power':
                this.#damage += 5;
                break;
            case 'Magnet Effect':
                this.#magnetRadius *= 1.5;
                this.#magnet.body.setCircle(this.#magnetRadius, this.#oldRadius - this.#magnetRadius,this.#oldRadius - this.#magnetRadius);
                break;
            case 'Increase Defense':
                this.#defense += 1;
            case 'Lower Spawn Speed':
                this.#spawnDelay *= 1.5;
                break;
            case 'Increase Total Health':
                const full = this.#farmerHealth === this.#maxHealth;
                this.#maxHealth += 1;
                this.#farmerHealth += 1;
                this.#farmerEmptyHealth.add(this.add.image(50 * (this.#maxHealth - 1), 0, ASSET_KEYS.EMPTY_HEART).setScale(0.04));
                if(!full){
                    this.#farmerHealthContainer.add(this.add.sprite(50 * (this.#maxHealth - 1), 0 , ASSET_KEYS.HEART).setScale(0.08).play(ASSET_KEYS.HEART).setVisible(false));
                } else {
                    this.#farmerHealthContainer.add(this.add.sprite(50 * (this.#maxHealth -1), 0 , ASSET_KEYS.HEART).setScale(0.08).play(ASSET_KEYS.HEART));
                }
            
                break;
            case 'Increase Bullet Size':
                this.#bulletSize += 0.04;
                break;
            case 'Increase Bullet Speed':
                this.#bulletSpeed += 30;
                break;
        }
    }

    applySpecialUpgrade(upgrade){
        switch (upgrade) {
            case 'Bullet Speed':
                this.#bulletSpeed += 35;
                break;
            case 'Health Regen':
                this.#healthRegen += 1;
                break;
            case 'Number of Projectiles':
                if(this.#projectiles !== 4){
                    this.#projectiles *= 2;
                }
                break;
            case 'Plant Score Multiplier':
                this.#plantMult *= 5;
            case 'Gem Score Multiplier':
                this.#scoreMult += 1;
                break;
        }
    }

    #enemyCheckPosition(){
        this.#enemyGroup.getChildren().forEach((enemy) => {
            if(this.#farmer.x <= enemy.x){
                enemy.setFlipX(true);
            } else{
                enemy.setFlipX(false);
            }
            this.physics.moveTo(enemy, this.#formerFarmerPosition.x + (this.#farmer.body.width/2), this.#formerFarmerPosition.y + (this.#farmer.body.height/2), enemy.getData('Speed'));
        })
    }

    #plantCheck(time){
        if(time < 100){
            this.#plantGroup.getChildren().forEach((plant) => {
                //this.add.sprite(x,y,ASSET_KEYS.WATER_BULLET,0).setScale(0.5).play(ASSET_KEYS.WATER_BULLET);
                //this.physics.moveTo(bullet,x,y,this.#bulletSpeed);
                plant.
                plant.body.setSize(100,100);
            });
        }
    }

    #regen(){
        if(this.#healthRegen <= 0){
            return;
        }
        if(this.#farmerHealth + 1 > this.#maxHealth)
            {
                this.#farmerHealth = this.#maxHealth;
            } else{
                for(let i = 0; i < this.#healthRegen; i++){
                    if(!(this.#farmerHealth + 1 > this.#maxHealth))
                    {
                        this.#farmerHealthContainer.getAt(this.#farmerHealth).setVisible(true);
                        this.#farmerHealth += 1;
                    }
                }
                
            }
    }


    #end(){
        //console.log('end was called');
        this.cameras.main.fadeOut(500);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(SCENE_KEYS.GAME_END_SCENE, {score: this.#score});
        });
    }

    #gameOver(){
        //console.log(upgrades);
        this.cameras.main.fadeOut(500);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(SCENE_KEYS.GAME_OVER_SCENE, {score: this.#score});
        });
    }
}