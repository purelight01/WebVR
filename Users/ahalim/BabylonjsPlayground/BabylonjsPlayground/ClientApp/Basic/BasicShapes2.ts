import 'babylon';
import { Common } from 'Common'
import { Game } from 'Game'

class BasicShape2 extends Game {
    protected camera: BABYLON.Camera;
    protected light: BABYLON.Light;

    constructor(canvasName: string, enableVR?: boolean) {
        super(canvasName, enableVR);
    }

    private createCameraAndLight(): void {
        // Camera
        this.camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 30, BABYLON.Vector3.Zero(), this.getScene());
        this.camera.attachControl(this.getCanvas(), true); 
        
        // Light
        this.light = new BABYLON.PointLight("light", new BABYLON.Vector3(20, 20, 20), this.getScene());
        this.light.diffuse = new BABYLON.Color3(0, 1, 0);
        this.light.specular = new BABYLON.Color3(1, 0, 1);
        this.light.intensity = 1.0;
    }

    createScene(): void {
        this.createCameraAndLight();

        BABYLON.Mesh.CreateBox("cube", 5, this.getScene());
    }
}

export function run(): void {
    // Create the game using the 'renderCanvas'
    let game = new BasicShape2(Common.canvasName);

    // Create the this.getScene()
    game.createScene();

    // start animation
    game.doRender();
}
