import { Plane } from './webgl/plane';
import { Shader } from './webgl/shader';
import vertexShader from './shaders/color.vert';
import fragmentShader from './shaders/display.frag';

export class Display {
    constructor(renderer, width, height) {
        this.renderer = renderer;
        this.size = {width, height};

        this.displayPlane = new Plane(this.renderer, 2, 2);

        this.shader = new Shader(this.renderer, vertexShader, fragmentShader);
        this.shader.createAttributes({position: 3, uv2: 2});
        this.shader.createUniforms({
            modelMatrix: 'mat4', 
            viewMatrix: 'mat4', 
            projectionMatrix: 'mat4', 
            map: 'sampler2D',
        });
    }

    resize(width, height) {
        this.size = {width, height};
    }

    setTexture(texture) {
        this.texture = texture;
    }

    render() {
        this.renderer.resize(this.size.width, this.size.height);
        this.renderer.set(this.displayPlane, this.shader, {map: this.texture});
        this.renderer.render({
            clearColor: [0.0, 0.0, 0.0, 1.0],
            clearDepth: 1.0,
        });
    }
}