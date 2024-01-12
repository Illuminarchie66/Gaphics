import * as OBJ from 'obj';
import * as THREE from 'three';

class Texture {
    constructor() {
        this.albedo = undefined;
        this.metalMap = undefined;
        this.normalMap = undefined;
        this.roughnessMap = undefined;
        this.aoMap = undefined;
        this.bumpMap = undefined;
        this.opacityMap = undefined;
        this.reflectionMap = undefined;
    }
}

class ModelLoader {
    constructor() {
        this.objloader = new OBJ.OBJLoader();
        this.mapLoader = new THREE.TextureLoader();
    }

    async getModels() {
        const modelData = await this.objloader.loadAsync('./resources/models/Flashlight_01.obj');
        return [modelData];
    }

    async getTextures() {
        const textureData = await Promise.all([
            this.loadTexture('leather_8', 'Leather_008_', 'jpg'),
            this.loadTexture('wall_stone_22', 'Wall_Stone_022_', 'jpg'),
            this.loadTexture('ropetextures', 'Net_3_', 'png'),
            this.loadTexture('floor_tiles_06_4k', 'floor_tiles_06_','png'),
            this.loadTexture('wood_floor_worn_4k.blend', 'wood_floor_worn_', 'png'),
            this.loadTexture('freepbr', 'vintage-tile1_', 'png'),
            this.loadTexture('plastic_scratched', 'plastic_0010_', 'png'),
            this.loadTexture('plastic_scratched_2', 'Scratched plastic_', 'jpg')
        ]);
        return textureData;
    }

    async loadTexture(dir, name, type) {
        const texture = new Texture(); 
        const [albedo, metal, normal, roughness, ao, bump, opacity, reflection] =
                await Promise.all([
                    this.mapLoader.load('./resources/' + dir + '/' + name + 'albedo.' + type),
                    this.mapLoader.load('./resources/' + dir + '/' + name + 'metallic.' + type),
                    this.mapLoader.load('./resources/' + dir + '/' + name + 'normal.' + type),
                    this.mapLoader.load('./resources/' + dir + '/' + name + 'roughness.' + type),
                    this.mapLoader.load('./resources/' + dir + '/' + name + 'ao.' + type),
                    this.mapLoader.load('./resources/' + dir + '/' + name + 'bump.' + type),
                    this.mapLoader.load('./resources/' + dir + '/' + name + 'opacity.' + type),
                    this.mapLoader.load('./resources/' + dir + '/' + name + 'reflection.' + type)
                ]);
        texture.albedo = albedo;
        texture.metalMap = metal;
        texture.normalMap = normal;
        texture.roughnessMap = roughness;
        texture.aoMap = ao;
        texture.bumpMap = bump;
        texture.opacityMap = opacity;
        texture.reflectionMap = reflection;
        return texture;
    }

    
}

export {ModelLoader} 
