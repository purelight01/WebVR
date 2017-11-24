import 'babylon';
import 'babylon.gui';
import 'babylonjs.loaders';
//import 'babylonjs.materials';
import 'cannon';
import 'oimo';
import { Common } from 'Common'
import { Game } from 'Game'


class PostProcess extends Game {
    /*
    * Private members
    */
    private _camera: BABYLON.FreeCamera;
    private _light: BABYLON.PointLight;
    private _plane: BABYLON.Mesh;
    private _box: BABYLON.Mesh;
    private _skybox: BABYLON.Mesh;

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
    * Creates a post-process and 
    */
    public createBlurPostProcess(): void {
        var blurH = new BABYLON.BlurPostProcess("blurH", new BABYLON.Vector2(1, 0), 8, 0.5, this._camera);
        var blurV = new BABYLON.BlurPostProcess("blurV", new BABYLON.Vector2(0, 1), 8, 0.5, this._camera);
        var bw = new BABYLON.BlackAndWhitePostProcess("bw", 1.0, this._camera);
    }

    /**
    * Creates a post-process render piepline
    */
    public createRenderPipeline(): void {
        // Create rendering pipeline
        var pipeline = new BABYLON.PostProcessRenderPipeline(this.getEngine(), "renderingPipeline");

        // Create effects
        pipeline.addEffect(new BABYLON.PostProcessRenderEffect(this.getEngine(), "blurHEffect", () => {
            return new BABYLON.BlurPostProcess("blurH", new BABYLON.Vector2(1, 0), 8, 0.5, null, BABYLON.Texture.BILINEAR_SAMPLINGMODE, this.getEngine());
        }));
        pipeline.addEffect(new BABYLON.PostProcessRenderEffect(this.getEngine(), "blurVEffect", () => {
            return new BABYLON.BlurPostProcess("blurV", new BABYLON.Vector2(0, 1), 8, 0.5, null, BABYLON.Texture.BILINEAR_SAMPLINGMODE, this.getEngine());
        }));
        pipeline.addEffect(new BABYLON.PostProcessRenderEffect(this.getEngine(), "blackAndWhiteEffect", () => {
            return new BABYLON.BlackAndWhitePostProcess("bw", 1.0, null, BABYLON.Texture.BILINEAR_SAMPLINGMODE, this.getEngine());
        }));

        // Add pipeline to the scene
        this.getScene().postProcessRenderPipelineManager.addPipeline(pipeline);

        // Attach to camera
        this.getScene().postProcessRenderPipelineManager.attachCamerasToRenderPipeline("renderingPipeline", this._camera);
    }

    /**
    * Detaches the render pipeline from the camera
    */
    public detachRenderPipeline(): void {
        this.getScene().postProcessRenderPipelineManager.detachCamerasFromRenderPipeline("renderingPipeline", this._camera);
    }

    /**
    * Disables the blur post-processes of the render pipeline
    * Only the "black and white" post-process is enabled
    */
    public disableBlurOnRenderPipeline(): void {
        this.getScene().postProcessRenderPipelineManager.disableEffectInPipeline("renderingPipeline", "blurHEffect", this._camera);
        this.getScene().postProcessRenderPipelineManager.disableEffectInPipeline("renderingPipeline", "blurVEffect", this._camera);
    }

    /**
    * Enables the blur post-processes of the render pipeline
    * The full pipeline is enabled
    */
    public enableBlurOnRenderPipeline(): void {
        this.getScene().postProcessRenderPipelineManager.enableEffectInPipeline("renderingPipeline", "blurHEffect", this._camera);
        this.getScene().postProcessRenderPipelineManager.enableEffectInPipeline("renderingPipeline", "blurVEffect", this._camera);
    }

    /**
    * Creates a "volumetric light scattering" post-process
    * The post-process isn't added to any pipeline and is directly
    * attached to the camera
    */
    public createVolumetricLightScatteringPostProcess(useDiffuseColor: boolean = false): void {
        // Import the status model
        BABYLON.SceneLoader.ImportMesh("", "assets/", "vls.babylon", this.getScene(), (meshes) => {
            this._box.dispose();

            meshes[0].scaling = new BABYLON.Vector3(4, 4, 4);
            meshes[0].rotation.y = -Math.PI / 2;
        });

        // Create the Volumetric Light Scattering post-process
        var vls = new BABYLON.VolumetricLightScatteringPostProcess("vls", {
            passRatio: 1.0,
            postProcessRatio: 1.0
        }, this._camera, null, 100);

        vls.density = 0.7;

        // Material of the VLS mesh
        var vlsMaterial = new BABYLON.StandardMaterial("vlsMaterial", this.getScene());
        vlsMaterial.diffuseTexture = new BABYLON.Texture("assets/sun.png", this.getScene());
        vlsMaterial.diffuseTexture.hasAlpha = true;

        if (useDiffuseColor) {
            vls.useDiffuseColor = true;
            vlsMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.5, 0.0); // Orange
        }

        // Configure the vls mesh (we kept the default mesh)
        vls.mesh.material = vlsMaterial;
        vls.mesh.position = new BABYLON.Vector3(150, 150, 150);
        vls.mesh.scaling = new BABYLON.Vector3(150, 150, 150);
    }

    /**
    * Creates the HDR renderping pipeline
    */
    public createHDRRenderPipeline(): void {
        /* TODO: HDRRenderingPipeline no longer exists
        //var hdr = new BABYLON.HDRRenderingPipeline("hdr", this.getScene(), 1.0);
        hdr.brightThreshold = 0.5;
        hdr.gaussCoeff = 0.5;
        hdr.gaussMean = 1.0;
        hdr.gaussStandDev = 7.5;
        hdr.minimumLuminance = 0.3;
        hdr.luminanceDecreaseRate = 0.4;
        hdr.luminanceIncreaserate = 0.4;
        hdr.exposure = 1.0;
        hdr.gaussMultiplier = 4;

        this.getScene().postProcessRenderPipelineManager.attachCamerasToRenderPipeline("hdr", this._camera);
        */
    }

    /**
    * Creates the SSAO rendering pipeline
    */
    public createSSAORenderPipeline(): void {
        this._box.dispose();
        this._plane.dispose();

        // Create some boxes and deactivate lighting (specular color and back faces)
        var boxMaterial = <BABYLON.StandardMaterial>this.getScene().getMaterialByName("box_material");
        boxMaterial.specularColor = BABYLON.Color3.Black();
        boxMaterial.emissiveColor = BABYLON.Color3.White();

        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 10; j++) {
                var box = BABYLON.Mesh.CreateBox("box" + i + " - " + j, 5, this.getScene());
                box.position = new BABYLON.Vector3(i * 5, 2.5, j * 5);
                box.rotation = new BABYLON.Vector3(i, i * j, j);
                box.material = boxMaterial;
            }
        }

        var ssao = new BABYLON.SSAORenderingPipeline("ssao", this.getScene(), { ssaoRatio: 0.5, combineRatio: 1.0 });
        ssao.fallOff = 0.0;
        ssao.area = 0.0075;
        ssao.radius = 0.0001;
        ssao.totalStrength = 1.0;

        /* TODO: these methods no longer exist
        ssao.getBlurHPostProcess().direction.x = 1;
        ssao.getBlurHPostProcess().blurWidth = 2;
        ssao.getBlurVPostProcess().direction.y = 1;
        ssao.getBlurVPostProcess().blurWidth = 2;
        */

        this.getScene().postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssao", this._camera);

        window.addEventListener("keydown", (evt: KeyboardEvent) => {
            // draw SSAO with scene when pressed "1"
            if (evt.keyCode === 49) {
                this.getScene().postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssao", this._camera);
                this.getScene().postProcessRenderPipelineManager.enableEffectInPipeline("ssao", ssao.SSAOCombineRenderEffect, this._camera);
            }
            // draw without SSAO when pressed "2"
            else if (evt.keyCode === 50) {
                this.getScene().postProcessRenderPipelineManager.detachCamerasFromRenderPipeline("ssao", this._camera);
            }
            // draw only SSAO when pressed "2"
            else if (evt.keyCode === 51) {
                this.getScene().postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssao", this._camera);
                this.getScene().postProcessRenderPipelineManager.disableEffectInPipeline("ssao", ssao.SSAOCombineRenderEffect, this._camera);
            }
        });
    }

    /**
    * Creates a scene with a plane and 6 spheres
    */
    public createScene(): void {
        // Textures
        var diffuseTexture = new BABYLON.Texture("assets/floor_diffuse.png", this.getScene());
        diffuseTexture.vScale = diffuseTexture.uScale = 5.0;

        var bumpTexture = new BABYLON.Texture("assets/floor_bump.png", this.getScene());
        bumpTexture.vScale = bumpTexture.uScale = 5.0;

        var boxTexture = new BABYLON.Texture("assets/wood.jpg", this.getScene());

        // Materials
        var planeMaterial = new BABYLON.StandardMaterial("plane_material", this.getScene());
        planeMaterial.diffuseTexture = diffuseTexture;
        planeMaterial.bumpTexture = bumpTexture;

        var boxMaterial = new BABYLON.StandardMaterial("box_material", this.getScene());
        boxMaterial.diffuseTexture = boxTexture;

        // Meshes
        this._plane = BABYLON.Mesh.CreateGround("ground", 100, 100, 2, this.getScene());
        this._plane.material = planeMaterial;

        this._box = BABYLON.Mesh.CreateBox("box", 5, this.getScene());
        this._box.refreshBoundingInfo();
        this._box.position.y = 2.5;
        this._box.material = boxMaterial;
    }
}

export function run(): void {
    let postProcess = new PostProcess(Common.canvasName, true);
    postProcess.createScene();
    /*
    postProcess.createBlurPostProcess();
    postProcess.createRenderPipeline();
    postProcess.disableBlurOnRenderPipeline();
    postProcess.enableBlurOnRenderPipeline();
    */
    
    postProcess.createVolumetricLightScatteringPostProcess();
    postProcess.createHDRRenderPipeline();
    postProcess.createSSAORenderPipeline()

    postProcess.doRender();
}
