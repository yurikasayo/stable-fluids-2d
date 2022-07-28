import { Framebuffer } from './webgl/framebuffer';
import { Plane } from './webgl/plane';
import { Shader } from './webgl/shader';
import { Camera } from './webgl/camera';

import vertexShader from './shaders/color.vert';
import colorFragmentShader from './shaders/color.frag';
import simulateFragmentShader from './shaders/simulate.frag';
import boundaryShader from './shaders/boundary.glsl';
import addShader from './shaders/add.glsl';
import advectShader from './shaders/advect.glsl';
import diffuseShader from './shaders/diffuse.glsl';
import divergenceShader from './shaders/divergence.glsl';
import poissonShader from './shaders/poisson.glsl';
import projectShader from './shaders/project.glsl';

export class Simulator {
    constructor(renderer, size) {
        this.renderer = renderer;

        this.size = size;
        this.velocity = new Framebuffer(this.renderer, this.size.width, this.size.height, true, 0.0);
        this.pressure = new Framebuffer(this.renderer, this.size.width, this.size.height, true, 0.0);
        this.tmpframe = new Framebuffer(this.renderer, this.size.width, this.size.height, true, null);

        this.plane = new Plane(this.renderer, 2, 2);

        this.colorShader = new Shader(this.renderer, vertexShader, colorFragmentShader);
        this.colorShader.createAttributes({position: 3, uv2: 2});
        this.colorShader.createUniforms({
            modelMatrix: 'mat4', 
            viewMatrix: 'mat4',
            projectionMatrix: 'mat4',
            resolution: 'vec2',
            map: 'sampler2D',
        });
        this.boundaryShader = new Shader(this.renderer, vertexShader, simulateFragmentShader + boundaryShader);
        this.boundaryShader.createAttributes({position: 3, uv2: 2});
        this.boundaryShader.createUniforms({
            modelMatrix: 'mat4', 
            viewMatrix: 'mat4', 
            projectionMatrix: 'mat4',
            resolution: 'vec2',
            map: 'sampler2D',
            bc: 'int',
        });
        this.addShader = new Shader(this.renderer, vertexShader, simulateFragmentShader + addShader);
        this.addShader.createAttributes({position: 3, uv2: 2});
        this.addShader.createUniforms({
            modelMatrix: 'mat4', 
            viewMatrix: 'mat4', 
            projectionMatrix: 'mat4',
            resolution: 'vec2',
            map: 'sampler2D',
            center: 'vec2',
            source: 'vec4',
            dt: 'float',
        });
        this.advectShader = new Shader(this.renderer, vertexShader, simulateFragmentShader + advectShader);
        this.advectShader.createAttributes({position: 3, uv2: 2});
        this.advectShader.createUniforms({
            modelMatrix: 'mat4', 
            viewMatrix: 'mat4', 
            projectionMatrix: 'mat4',
            resolution: 'vec2',
            map: 'sampler2D',
            velocity: 'sampler2D',
            dt: 'float',
        });
        this.diffuseShader = new Shader(this.renderer, vertexShader, simulateFragmentShader + diffuseShader);
        this.diffuseShader.createAttributes({position: 3, uv2: 2});
        this.diffuseShader.createUniforms({
            modelMatrix: 'mat4', 
            viewMatrix: 'mat4',
            projectionMatrix: 'mat4',
            resolution: 'vec2',
            map: 'sampler2D',
            map0: 'sampler2D',
            viscosity: 'float',
            dt: 'float',
        });
        this.divergenceShader = new Shader(this.renderer, vertexShader, simulateFragmentShader + divergenceShader);
        this.divergenceShader.createAttributes({position: 3, uv2: 2});
        this.divergenceShader.createUniforms({
            modelMatrix: 'mat4', 
            viewMatrix: 'mat4',
            projectionMatrix: 'mat4',
            startZ: 'float',
            resolution: 'vec2',
            map: 'sampler3D',
        });
        this.poissonShader = new Shader(this.renderer, vertexShader, simulateFragmentShader + poissonShader);
        this.poissonShader.createAttributes({position: 3, uv2: 2});
        this.poissonShader.createUniforms({
            modelMatrix: 'mat4', 
            viewMatrix: 'mat4',
            projectionMatrix: 'mat4',
            resolution: 'vec2',
            map: 'sampler2D',
            divergence: 'sampler2D',
            rho: 'float',
            dt: 'float',
        });
        this.projectShader = new Shader(this.renderer, vertexShader, simulateFragmentShader + projectShader);
        this.projectShader.createAttributes({position: 3, uv2: 2});
        this.projectShader.createUniforms({
            modelMatrix: 'mat4', 
            viewMatrix: 'mat4',
            projectionMatrix: 'mat4',
            resolution: 'vec2',
            map: 'sampler2D',
            pressure: 'sampler2D',
            rho: 'float',
            dt: 'float',
        });

        this.camera = new Camera();

        this.param = {
            dt: 1 / 60,
            iteration: 10,
            viscosity: 1e-3,
            rho: 10,
        }
    }

    resize(size) {
        this.size = size;
        this.velocity.resize(size.width, size.height);
        this.pressure.resize(size.width, size.height);
        this.tmpframe.resize(size.width, size.height);
    }

    setRenderer(shader, uniforms) {
        this.renderer.set(this.plane, shader, uniforms, this.camera);
    }
    
    add(source, center) {
        // add force
        let uniforms = {
            map: this.velocity.texture, 
            source: source, 
            center: center, 
            dt: this.param.dt,
        };
        this.setRenderer(this.addShader, uniforms);
        this.velocity.render();

        uniforms = {
            map: this.velocity.texture, 
            bc: 1,
        };
        this.setRenderer(this.boundaryShader, uniforms);
        this.velocity.render();
    }

    render() {
        // advect
        let uniforms = {
            map: this.velocity.texture, 
            velocity: this.velocity.texture,
            dt: this.param.dt, 
        };
        this.setRenderer(this.advectShader, uniforms);
        this.velocity.render();

        uniforms = {
            map: this.velocity.texture,
            bc: 1,
        };
        this.setRenderer(this.boundaryShader, uniforms);
        this.velocity.render();

        // diffuse
        uniforms = {
            map: this.velocity.texture,
        };
        this.setRenderer(this.colorShader, uniforms);
        this.tmpframe.render();

        for (let i = 0; i < this.param.iteration; i++) {
            uniforms = {
                map: this.velocity.texture,
                map0: this.tmpframe.texture,
                viscosity: this.param.viscosity,
                dt: this.param.dt,
            };
            this.setRenderer(this.diffuseShader, uniforms);
            this.velocity.render();

            uniforms = {
                map: this.velocity.texture, 
                bc: 1,
            };
            this.setRenderer(this.boundaryShader, uniforms);
            this.velocity.render();
        }
        
        // project
        uniforms = {
            map: this.velocity.texture,
        }
        this.setRenderer(this.divergenceShader, uniforms);
        this.tmpframe.render();

        uniforms = {
            map: this.tmpframe.texture, 
            bc: 0,
        };
        this.setRenderer(this.boundaryShader, uniforms);
        this.tmpframe.render();

        for (let i = 0; i < this.param.iteration; i++) {
            uniforms = {
                map: this.pressure.texture,
                divergence: this.tmpframe.texture,
                rho: this.param.rho,
                dt: this.param.dt,
            };
            this.setRenderer(this.poissonShader, uniforms);
            this.pressure.render();

            uniforms = {
                map: this.pressure.texture, 
                bc: 0,
            };
            this.setRenderer(this.boundaryShader, uniforms);
            this.pressure.render();
        }

        uniforms = {
            map: this.velocity.texture,
            pressure: this.pressure.texture,
            rho: this.param.rho,
            dt: this.param.dt,
        };
        this.setRenderer(this.projectShader, uniforms);
        this.velocity.render();

        uniforms = {
            map: this.velocity.texture,
            bc: 1,
        };
        this.setRenderer(this.boundaryShader, uniforms);
        this.velocity.render();
    }
}