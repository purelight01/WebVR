﻿import 'babylon';
import 'babylon.gui';
import 'babylonjs.loaders';
//import 'babylonjs.materials';
import 'cannon';
import 'oimo';
import { Common } from 'Common'
import { Game } from 'Game'
import { VRHelper } from 'Basic/VRHelper'

class BasicMaterials extends Game {
    /*
    * Private members
    */
    private _camera: BABYLON.ArcRotateCamera;
    private _light: BABYLON.PointLight;
    private readonly floorName = "My Floor";

    /*
    * Public members
    */
    constructor(canvasName: string, enableVR?: boolean) {
        super(canvasName, enableVR);

        this.getScene().fogEnabled = true; // Fog is enabled in the scene
        this.getScene().fogMode = BABYLON.Scene.FOGMODE_EXP; // Linear fog
        this.getScene().fogColor = new BABYLON.Color3(1, 1, 1); // White
        this.getScene().fogDensity = 0.005;

        // Camera
        this._camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 150, BABYLON.Vector3.Zero(), this.getScene());
        this._camera.attachControl(this.getCanvas());

        // Light
        this._light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(-60, 60, 80), this.getScene());
        this._light.intensity = 1;
    }

    /**
    * Creates a scene with a plane and 6 spheres
    */
    public createScene(): void {
        // Plane
        let plane = this._createPlane();
        // Spheres
        let spheres = this._createSpheres();
        // Skybox
        let skybox = this._createSkybox();

        // Mirror texture
        let mirrorTexture = new BABYLON.MirrorTexture("mirrorTexture", 1024, this.getScene());
        mirrorTexture.mirrorPlane = BABYLON.Plane.FromPositionAndNormal(new BABYLON.Vector3(0, -5, 0), new BABYLON.Vector3(0, -1, 0));
        // Set meshes and remove plane + skybox
        for (let i = 0; i < spheres.length; i++) {
            mirrorTexture.renderList.push(spheres[i]);
        }
        // Apply mirror texture
        (<BABYLON.StandardMaterial>plane.material).reflectionTexture = mirrorTexture;

        let vrHelper = new VRHelper(this.getScene(), this.getCanvas(), this.floorName);
        vrHelper.createVRCamera();
    }

    /**
    * Creates a plane with a normal map texture
    */
    private _createPlane(): BABYLON.Mesh {
        let material = new BABYLON.StandardMaterial("planeMaterial", this.getScene());
        material.diffuseTexture = this._configureTexture(new BABYLON.Texture("assets/floor_diffuse.png", this.getScene()));
        material.bumpTexture = this._configureTexture(new BABYLON.Texture("assets/floor_bump.png", this.getScene()));
        material.fogEnabled = false;

        let plane = BABYLON.Mesh.CreatePlane(this.floorName, 150, this.getScene());
        plane.material = material;
        plane.position.y -= 5;
        plane.rotation.x = Math.PI / 2;

        return plane;
    }

    /**
    * Creates 7 spheres with different materials 
    */
    private _createSpheres(): BABYLON.Mesh[] {
        let spheres: BABYLON.Mesh[] = [];
        let initialX = 70;

        for (let i = 0; i < 7; i++) {
            let sphere = BABYLON.Mesh.CreateSphere("sphere" + i, 10, 9, this.getScene());
            sphere.position.x = (initialX -= 15);
            sphere.material = new BABYLON.StandardMaterial("sphereMaterial" + i, this.getScene());
            (<BABYLON.StandardMaterial>sphere.material).fogEnabled = true;
            spheres.push(sphere);
        }

        // Material 1 (diffuse color)
        let material1 = <BABYLON.StandardMaterial>spheres[0].material;
        material1.diffuseColor = new BABYLON.Color3(1, 0, 0);

        // Material 2 (Texture with alpha)
        let material2 = <BABYLON.StandardMaterial>spheres[1].material;
        material2.diffuseTexture = new BABYLON.Texture("assets/cloud.png", this.getScene());
        material2.diffuseTexture.hasAlpha = true;

        // Material 3 (Alpha)
        let material3 = <BABYLON.StandardMaterial>spheres[2].material;
        material3.specularColor = new BABYLON.Color3(0, 1, 0);
        material3.specularPower = 10;
        material3.useSpecularOverAlpha = true;
        material3.alpha = 0.5;

        // Mateiral 4 (back face culling)
        let material4 = <BABYLON.StandardMaterial>spheres[3].material;
        material4.diffuseTexture = material2.diffuseTexture;
        material4.backFaceCulling = false;

        // Material 5 (textures repeat)
        let material5 = <BABYLON.StandardMaterial>spheres[4].material;
        material5.diffuseTexture = this._configureTexture(new BABYLON.Texture("assets/cloud.png", this.getScene()));
        material5.diffuseTexture.hasAlpha = true;

        // Material 6 (texture)
        let material6 = <BABYLON.StandardMaterial>spheres[5].material;
        material6.diffuseTexture = new BABYLON.Texture("assets/floor_ao.png", this.getScene());

        // Material 7 (share the same material as the plane)
        spheres[6].material = this.getScene().getMeshByName(this.floorName).material;

        return spheres;
    }

    private _createSkybox(): BABYLON.Mesh {
        let material = new BABYLON.StandardMaterial("skyboxMaterial", this.getScene());
        material.reflectionTexture = new BABYLON.CubeTexture("assets/skybox/TropicalSunnyDay", this.getScene());
        material.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        material.backFaceCulling = false;
        material.fogEnabled = false;

        let skybox = BABYLON.Mesh.CreateBox("skybox", 300, this.getScene());
        skybox.material = material;

        return skybox;
    }

    /*
    * Configures a given texture
    * Changes the uv scaling
    */
    private _configureTexture(texture: BABYLON.Texture): BABYLON.Texture {
        texture.vScale = texture.uScale = 5;

        return texture;
    }
}

export function run(): void {
    let materials = new BasicMaterials(Common.canvasName);
    materials.createScene();
    materials.doRender();
}