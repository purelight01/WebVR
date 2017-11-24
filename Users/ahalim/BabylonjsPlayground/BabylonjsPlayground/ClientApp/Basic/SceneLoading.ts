import 'babylon';
import 'babylon.gui';
import 'babylonjs.loaders';
//import 'babylonjs.materials';
import 'cannon';
import 'oimo';
import { Common } from 'Common'
//import { Game } from 'Game'

class SceneLoading {
    /*
    * Public members
    */
    
    /*
    * Private members
    */
    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;
    private _camera:    BABYLON.FreeCamera;
    private _light:     BABYLON.PointLight;
    
    constructor(canvas: HTMLCanvasElement) {
        // Engine
        this._engine = new BABYLON.Engine(canvas);
        
        // Scene
        this._scene = new BABYLON.Scene(this._engine);

        this._camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(29, 13, 23), this._scene);
        this._camera.setTarget(new BABYLON.Vector3(0, 0, 0));
        this._camera.attachControl(this._canvas);
        
        // Light
        this._light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(-60, 60, 80), this._scene);
        this._light.intensity = 1;
        
        /**
        * Load an exported scene
        * This static method contains 6 parameters
        * 1: the directory of the scene file
        * 2: the scene file name
        * 3: the Babylon.js engine
        * 4: a success callback, providing the new scene created by the loader
        * 5: progress callback, empty as default (can be null)
        * 6: error callback, providing the new scene created by the loader 
        */
        BABYLON.SceneLoader.Load("assets/scenes/", "rabbit.babylon", this._engine,
        (scene: BABYLON.Scene) => { // Success calblack
            this._scene = scene;
            
            // We can now access the scene.meshes array etc.
            // Decal the meshes to 10 units on X
            for (var i=0; i < this._scene.meshes.length; i++) {
                this._scene.meshes[i].position.addInPlace(new BABYLON.Vector3(10, 0, 0));
            }
            
            // Just append the same scene 
            this._appendScene();
            
        }, () => { // Progress callback
            // Do something with your web page :)
        }, (scene: BABYLON.Scene) => { // Error callback
            
        });

    }
    
    /**
    * Runs the engine render loop
    */
    public runRenderLoop(): void {
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });
    }
    
    /**
    * This method appends new scene with the already existing scene
    * Here, we are appending the same scene at its original position
    */
    private _appendScene(): void {
        BABYLON.SceneLoader.Append("./", "assets/scenes/rabbit.babylon", this._scene, (scene: BABYLON.Scene) => {
            // Do something you want
        }, () => {
            // Progress
        }, (scene: BABYLON.Scene) => {
            // Error
        });
    }
    
    /**
    * Import the skull mesh (available in the Babylon.js examples)
    * This methods imports meshes and only meshes.
    */
    private _importMesh(): void {
        BABYLON.SceneLoader.ImportMesh("", "./", "assets/meshes/cat.babylon", this._scene,
        (meshes, particles, skeletons) => { // Success callback
            // Here, meshes contains only one mesh: the skull (meshes[0])
            // Particles array is empty
            // skeletons array is empty
            
        }, () => { // Progress callback
            
        }, (scene: BABYLON.Scene, e: any) => {
            // Do something
            console.log(e.message);
        });
    }
}

export function run(): void {
    let canvas = <HTMLCanvasElement>document.getElementById(Common.canvasName);
    let sceneLoading = new SceneLoading(canvas);
    sceneLoading.runRenderLoop();
}
