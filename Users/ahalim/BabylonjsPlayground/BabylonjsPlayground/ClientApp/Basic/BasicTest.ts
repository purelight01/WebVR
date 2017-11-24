//import * as BABYLON from 'babylonjs'
import 'babylon';
import { Common } from 'Common'
import { Game } from 'Game'

class BasicShape extends Game {
    protected camera: BABYLON.FreeCamera;
    protected light: BABYLON.Light;

    constructor(canvasName: string, enableVR?: boolean) {
        super(canvasName, enableVR);
    }

    createScene(): void {
        // create a basic BJS Scene object

        // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
        this.camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), this.getScene());

        // target the camera to this.getScene() origin
        this.camera.setTarget(BABYLON.Vector3.Zero());

        // attach the camera to the canvas
        this.camera.attachControl(this.getCanvas(), false);

        // create a basic light, aiming 0,1,0 - meaning, to the sky
        this.light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), this.getScene());

        // create a built-in "sphere" shape; with 16 segments and diameter of 2
        let sphere = BABYLON.MeshBuilder.CreateSphere('sphere1', {segments: 16, diameter: 2}, this.getScene());

        // move the sphere upward 1/2 of its height
        sphere.position.y = 1;

        // create a built-in "ground" shape
        let ground = BABYLON.MeshBuilder.CreateGround('ground1', {width: 6, height: 6, subdivisions: 2}, this.getScene());
    }
}

export function run(): void {
    // Create the game using the 'renderCanvas'
    let game = new BasicShape(Common.canvasName);

    // Create the this.getScene()
    game.createScene();

    // start animation
    game.doRender();
}
