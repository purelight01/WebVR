import 'babylon';
import 'babylon.gui';
import 'babylonjs.loaders';
//import 'babylonjs.materials';
import 'cannon';
import 'oimo';
import { Common } from 'Common'
import { Game } from 'Game'
import { VRHelper } from 'Basic/VRHelper'

class PowerEase extends BABYLON.EasingFunction implements BABYLON.IEasingFunction {
    constructor(public power: number = 2) {
        // Call constructor of BABYLON.EasingFunction
        super();
    }
    
    /**
    * Called to animate each frame. 
    * must return a number
    */
    public easeInCore(gradient: number): number {
        var y = Math.max(0.0, this.power);
        return Math.pow(gradient, y);
    }
}

class Animation extends Game {
    /*
    * Private members
    */
    private _camera: BABYLON.FreeCamera;
    private _light: BABYLON.PointLight;
    private _plane: BABYLON.Mesh;
    private _box: BABYLON.Mesh;
    private _skybox: BABYLON.Mesh;
    private readonly floorName = "My Floor";
    
    constructor(canvasName: string, enableVR?: boolean) {
        super(canvasName, enableVR);
        // Camera
        this._camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(29, 13, 23), this.getScene());
        this._camera.setTarget(new BABYLON.Vector3(0, 0, 0));
        this._camera.attachControl(this.getCanvas());
        
        // Light
        this._light = new BABYLON.PointLight("Point", new BABYLON.Vector3(-60, 60, 80), this.getScene());
        this._light.intensity = 1;
    }
    
    /**
    * Runs the engine render loop
    */
    public runRenderLoop(): void {
        this.getEngine().runRenderLoop(() => {
            this.getScene().render();
        });
    }
    
    /**
    * Animates the cube thanks to a custom algorithm.
    * This is an example of animation that you can create
    * only using the tools provided by Babylon.js instead of
    * writing this algorithm yourself.
    */
    public animateThroughCode(): void {
        var angle = 0;
        var radius = 10;
        this.getScene().registerBeforeRender(() => {
            this._box.position.x = radius * Math.cos(angle);
            this._box.position.y = 2.5;
            this._box.position.z = radius * Math.sin(angle);
            angle += 0.01;
        });
    }
    
    /**
    * Creates an animation applied on the box
    * It follows a specific path
    */
    public createBoxAnimation(): void {
        // Create the animation manager
        var simpleAnimation = new BABYLON.Animation("boxAnimationSimple", "rotation", 1, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        var complexAnimation = new BABYLON.Animation("boxAnimationComplex", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        
        // Create keys
        var simpleKeys = [
            {
                frame: 0,
                value: new BABYLON.Vector3(0, 0, 0)
            },
            {
                frame: 20,
                value: new BABYLON.Vector3(0, Math.PI, 0)
            }
        ];
        
        var complexKeys = [];
        for (var i=0; i < 360; i++) {
            var angle = BABYLON.Tools.ToRadians(i);
            complexKeys.push({
                frame: i,
                value: new BABYLON.Vector3(10 * Math.cos(angle), 2.5, 10 * Math.sin(angle))
            });
        }
        
        // Finish: add the animation to the node and play
        simpleAnimation.setKeys(simpleKeys);
        complexAnimation.setKeys(complexKeys);
        
        //this._box.animations.push(simpleAnimation);
        this._box.animations.push(complexAnimation);
        
        // Finally, start the animation(s) of the box
        var animation = this.getScene().beginAnimation(this._box, 0, 360, false, 1.0, () => {
            console.log("Animation Finished");
        });
    }
    
    /**
    * 
    */
    public createAnimationWithEasingFunction(customEaseFunction: boolean = true): void {
        // Create the animation manager
        var easingAnimation = new BABYLON.Animation("easingAnimation", "rotation", 10, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        // Create keys
        var simpleKeys = [
            {
                frame: 0,
                value: new BABYLON.Vector3(0, 0, 0)
            },
            {
                frame: 20,
                value: new BABYLON.Vector3(0, Math.PI, 0)
            },
            {
                frame: 40,
                value: new BABYLON.Vector3(Math.PI, 0, 0)
            }
        ];
        
        // Set keys
        easingAnimation.setKeys(simpleKeys);
        
        // Push animation
        this._box.animations.push(easingAnimation);
        
        // Set easing function
        if (customEaseFunction) {
            var customEase = new PowerEase(3);
            customEase.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
            easingAnimation.setEasingFunction(customEase);
        }
        else {
            var ease = new BABYLON.CircleEase();
            ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
            easingAnimation.setEasingFunction(ease);
        }
        
        // Finally, start the animation(s) of the box
        this.getScene().beginAnimation(this._box, 0, 40, true, 1.0, () => {
            console.log("Animation Finished");
        });
    }
    
    /**
    * Loads and plays the animation of a character
    * Characters are 3D models with bones, animated using the
    * "_matrix" property
    */
    public animateCharacter(): void {
        // Remove box
        this._box.dispose();
        
        // Load character
        BABYLON.SceneLoader.ImportMesh("", "assets/scenes/dude/", "dude.babylon", this.getScene(), (meshes, particleSystems, skeletons) => {
            meshes.forEach((mesh) => {
                mesh.scaling = mesh.scaling.multiply(new BABYLON.Vector3(0.2, 0.2, 0.2));
                mesh.position = new BABYLON.Vector3(1, 0, 5);
            });
            
            // Both must write "true" in the console
            console.log(skeletons.length === 1);
            console.log(this.getScene().getSkeletonByName("Skeleton0") === skeletons[0]);
            
            // Simply begin the animations of the skeleton
            // To remember, a skeleton has multiple bones, where each bone
            // as a list of animations of type BABYLON.Animation
            this.getScene().beginAnimation(skeletons[0], 0, 150, true, 1.0);
        });
        
        /*
        // Or use the .Append function
        
        BABYLON.SceneLoader.Append("./", "dude.babylon", this.getScene(), (scene) => {
            var skeleton = this.getScene().getSkeletonByName("Skeleton0");
            
            this.getScene().beginAnimation(skeleton, 0, 150, true, 1.0);
        });
        */
        let vrHelper = new VRHelper(this.getScene(), this.getCanvas(), this.floorName);
        vrHelper.createVRCamera();
    }
    
    /**
    * Creates a scene with a plane and a cube
    */
    public createScene(): void {
        // Textures
        var diffuseTexture = new BABYLON.Texture("assets/floor_diffuse.png", this.getScene());
        diffuseTexture.vScale = diffuseTexture.uScale = 5.0;
        
        var boxTexture = new BABYLON.Texture("assets/wood.jpg", this.getScene());
        
        // Materials
        var planeMaterial = new BABYLON.StandardMaterial("plane_material", this.getScene());
        planeMaterial.diffuseTexture = diffuseTexture;
        
        var boxMaterial = new BABYLON.StandardMaterial("box_material", this.getScene());
        boxMaterial.diffuseTexture = boxTexture;
        
        // Meshes
        this._plane = BABYLON.Mesh.CreateGround(this.floorName, 100, 100, 2, this.getScene());
        this._plane.material = planeMaterial;
        
        this._box = BABYLON.Mesh.CreateBox("box", 5, this.getScene());
        this._box.refreshBoundingInfo();
        this._box.position.y = 2.5;
        this._box.material = boxMaterial;
    }
}

export function run(): void {
    let animation = new Animation(Common.canvasName);
    animation.createScene();
    //animation.animateThroughCode();
    //animation.createBoxAnimation();
    //animation.createAnimationWithEasingFunction();
    animation.animateCharacter();
    animation.doRender();
}