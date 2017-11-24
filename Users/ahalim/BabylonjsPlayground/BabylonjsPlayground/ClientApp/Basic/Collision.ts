import 'babylon';
import 'babylon.gui';
import 'babylonjs.loaders';
//import 'babylonjs.materials';
import 'cannon';
import 'oimo';
import { Common } from 'Common'
import { Game } from 'Game'


class Collision extends Game {
    /*
    * Private members
    */
    private _camera:    BABYLON.FreeCamera;
    private _light:     BABYLON.PointLight;
    private _plane:     BABYLON.Mesh;
    private _box:       BABYLON.Mesh;
    private _box2:      BABYLON.Mesh;
    private _sphere:    BABYLON.Mesh;
    
    /*
    * Public members
    */
    constructor(canvasName: string, enableVR?: boolean) {
        super(canvasName, enableVR);
        // Camera
        this._camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(29, 13, 23), this.getScene());
        this._camera.setTarget(new BABYLON.Vector3(0, 0, 0));
        this._camera.attachControl(this.getCanvas());
        
        // Light
        this._light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(-60, 60, 80), this.getScene());
        this._light.intensity = 1;
    }
    
    /**
    * Configures collisions in scene with gravity and ellipsoid
    */
    public createCollisions() : void {
        // Enable collisions in scene
        this.getScene().collisionsEnabled = true;
        
        // Enable gravity on camera
        this._camera.applyGravity = true;
        
        // Configure camera to check collisions
        this._camera.checkCollisions = true;
        
        // Configure camera's ellipsoid
        this._camera.ellipsoid = new BABYLON.Vector3(1, 1.8, 1);
        
        // Configure gravity in scene
        this.getScene().gravity = new BABYLON.Vector3(0, -0.03, 0);
        
        // Enable collisions on plane and box
        this._plane.checkCollisions = true;
        this._box.checkCollisions = true;
        this._box2.checkCollisions = true;
        this._sphere.checkCollisions = true;
    }
    
    /**
    * Creates physics in scene with the Oimo.js plugin
    * Uses different impostors for sphere and boxes
    */
    public createPhysics(): void {
        this.getScene().enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.OimoJSPlugin());
        //this._plane.setPhysicsState(BABYLON.PhysicsEngine.PlaneImpostor, { mass: 0, friction: 0.5, restitution: 0.5 });
        this._plane.physicsImpostor = new BABYLON.PhysicsImpostor(this._plane, BABYLON.PhysicsImpostor.PlaneImpostor, { mass: 0, friction: 0.5, restitution: 0.5 }, this.getScene());

        //this._box.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, { mass: 1, friction: 0.5, restitution: 0.5 });
        this._box.physicsImpostor = new BABYLON.PhysicsImpostor(this._box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, friction: 0.5, restitution: 0.5 }, this.getScene());

        //this._box2.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, { mass: 1, friction: 0.5, restitution: 0.5 });
        this._box2.physicsImpostor = new BABYLON.PhysicsImpostor(this._box2, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, friction: 0.5, restitution: 0.5 }, this.getScene());

        //this._sphere.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, { mass: 10, friction: 0.5, restitution: 0 });
        this._sphere.physicsImpostor = new BABYLON.PhysicsImpostor(this._sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 10, friction: 0.5, restitution: 0.5 }, this.getScene());
        
        this._box2.applyImpulse(new BABYLON.Vector3(-18, 0, 0), new BABYLON.Vector3(this._box2.position.x, 0, 0));
        this._sphere.applyImpulse(new BABYLON.Vector3(0, -10, 0), this._sphere.position);
    }
    
    /**
    * Disables the physics engine for bot Cannon.js and Oimo.js plugins
    */
    public disablePhysics(): void {
        this.getScene().disablePhysicsEngine();
    }
    
    /**
    * Creates a scene with a plane and 6 spheres
    */
    public createScene(): void {
        // Textures
        let diffuseTexture = new BABYLON.Texture("assets/floor_diffuse.png", this.getScene());
        diffuseTexture.vScale = diffuseTexture.uScale = 5.0;
        
        let bumpTexture = new BABYLON.Texture("assets/floor_bump.png", this.getScene());
        bumpTexture.vScale = bumpTexture.uScale = 5.0;
        
        let specularTexture = new BABYLON.Texture("assets/floor_specular.png", this.getScene());
        specularTexture.vScale = specularTexture.uScale = 5.0;
        
        let ambientTexture = new BABYLON.Texture("assets/floor_ao.png", this.getScene());
        ambientTexture.vScale = ambientTexture.uScale = 5.0;
        
        let boxTexture = new BABYLON.Texture("assets/wood.jpg", this.getScene());
        
        let sphereTexture = new BABYLON.Texture("assets/sphere.jpg", this.getScene());
        
        // Materials
        let planeMaterial = new BABYLON.StandardMaterial("plane_material", this.getScene());
        planeMaterial.diffuseTexture = diffuseTexture;
        planeMaterial.bumpTexture = bumpTexture;
        planeMaterial.specularTexture = specularTexture;
        planeMaterial.ambientTexture = ambientTexture;
        
        let boxMaterial = new BABYLON.StandardMaterial("box_material", this.getScene());
        boxMaterial.diffuseTexture = boxTexture;
        
        let sphereMaterial = new BABYLON.StandardMaterial("sphere_material", this.getScene());
        sphereMaterial.diffuseTexture = sphereTexture;
        
        // Meshes
        this._plane = BABYLON.Mesh.CreateGround("ground", 100, 100, 2, this.getScene());// BABYLON.Mesh.CreatePlane("plane", 100, this.getScene());
        //this._plane.rotation.x = Math.PI / 2;
        this._plane.material = planeMaterial;
        
        this._box = BABYLON.Mesh.CreateBox("box", 5, this.getScene());
        this._box.refreshBoundingInfo();
        this._box.position.y = 2.5;
        this._box.material = boxMaterial;
        
        this._box2 = this._box.clone("box2");
        this._box2.position.x = 20;
        
        this._sphere = BABYLON.Mesh.CreateSphere("sphere", 6, 3, this.getScene());
        this._sphere.position.x = 3;
        this._sphere.position.y = 18;
        this._sphere.material = sphereMaterial;
        
        // Show bounding boxes of meshes (default is false)
        //this._plane.showBoundingBox = true;
        //this._box.showBoundingBox = true;
        //this._sphere.showBoundingBox = true;
    }
}

export function run(): void {
    let collision = new Collision(Common.canvasName, true);
    collision.createScene();
    collision.createCollisions();
    collision.createPhysics();
    collision.doRender();
}