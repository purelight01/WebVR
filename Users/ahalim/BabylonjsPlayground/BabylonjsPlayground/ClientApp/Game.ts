import 'babylon';
import { Common } from 'Common'

export abstract class Game {
    private canvas: HTMLCanvasElement;
    private engine: BABYLON.Engine;
    private scene: BABYLON.Scene;

    protected getCanvas(): HTMLCanvasElement { return this.canvas; }
    protected getEngine(): BABYLON.Engine { return this.engine; }
    protected getScene(): BABYLON.Scene { return this.scene; }

    public constructor(canvasElement: string, enableVR?: boolean) {
        // Create canvas and engine
        this.canvas = <HTMLCanvasElement>document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = new BABYLON.Scene(this.getEngine());

        if (enableVR) {
            this.scene.createDefaultVRExperience();
        }
    }

    public abstract createScene(): void; 

    public doRender(): void {
        // run the render loop
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        // the canvas/window resize event handler
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
}
