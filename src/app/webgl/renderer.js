import * as glMatrix from 'gl-matrix';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        const gl = this.gl = canvas.getContext('webgl2');
        if (!gl) {
            alert('WebGL2 unsupported.');
        }

        const ext = gl.getExtension("EXT_color_buffer_float");
        if (!ext) {
            alert("need EXT_color_buffer_float")
        }

        gl.enable(gl.CULL_FACE);

        this.geometries = [];
        this.shader = null;
        this.uniforms = [];
        this.camera = null;
    }

    resize(width, height) {
        this.gl.viewport(0, 0, width, height);
    }

    set(geometries, shader, uniforms) {
        if (Array.isArray(geometries)) {
            this.geometries = geometries;
        } else {
            this.geometries = [geometries];
        }
        this.shader = shader;
        this.uniforms = uniforms;
    }

    render({framebuffer = null, clearColor = null, clearDepth = null}) {
        const gl = this.gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        
        if (clearColor) {
            gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }

        if (clearDepth) {
            gl.clearDepth(clearDepth);
            gl.clear(gl.DEPTH_BUFFER_BIT);
        }

        gl.useProgram(this.shader.program);
        this.setUniforms();

        for (let geometry of this.geometries) {
            this.setAttributes(geometry);
            gl.drawElements(gl.TRIANGLES, geometry.indexLength, gl.UNSIGNED_BYTE, 0);
        }

        gl.flush();

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    setAttributes(geometry) {
        const gl = this.gl;
        const shader = this.shader;

        for (let key in geometry.vbos) {
            if (key in shader.attributes) {
                gl.bindBuffer(gl.ARRAY_BUFFER, geometry.vbos[key]);
                gl.enableVertexAttribArray(shader.attributes[key].location);
                gl.vertexAttribPointer(shader.attributes[key].location, shader.attributes[key].size, gl.FLOAT, false, 0, 0);
            }
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.ibo);
    }

    setUniforms() {
        const gl = this.gl;
        const shader = this.shader;
        const uniforms = this.uniforms;

        let textureId = 0;

        for (let key in uniforms) {
            if (key in shader.uniforms) {
                if (shader.uniforms[key].type == "sampler2D") {
                    gl.activeTexture(gl.TEXTURE0 + textureId);
                    gl.bindTexture(gl.TEXTURE_2D, uniforms[key]);
                    this.setUniform(shader.uniforms[key].location, textureId, shader.uniforms[key].type);
                    textureId++;
                } else {
                    this.setUniform(shader.uniforms[key].location, uniforms[key], shader.uniforms[key].type);  
                }
            }
        }
    }

    setUniform(location, value, type) {
        const gl = this.gl;

        switch (type) {
            case 'int':
            case 'sampler2D':
                gl.uniform1i(location, value);
                break;

            case 'float':
                gl.uniform1f(location, value);
                break;

            case 'vec2':
                gl.uniform2fv(location, value);
                break;

            case 'vec3':
                gl.uniform3fv(location, value);
                break;

            case 'vec4':
                gl.uniform4fv(location, value);
                break;

            case 'mat4':
                gl.uniformMatrix4fv(location, false, value);
                break;

            default:
                break;
        }
    }

    clearColor(framebuffer, color) {
        const gl = this.gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.clearColor(color[0], color[1], color[2], color[3]);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.flush();
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}