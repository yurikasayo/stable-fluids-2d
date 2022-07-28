export class Framebuffer {
    constructor(renderer, width, height, double = true, initValue = null) {
        this.renderer = renderer;
        this.size = {width, height};

        if (double) {
            this.frameId = 0;
            this.frame = new Array(2);
            this.frame[0] = this.createFramebuffer(width, height, initValue);
            this.frame[1] = this.createFramebuffer(width, height, initValue);
            this.texture = this.frame[1].texture;
        } else {
            this.frame = this.createFramebuffer(width, height, initValue);
            this.texture = this.frame.texture;
        }

        this.isDouble = double;
        this.initValue = initValue;
    }

    createFramebuffer(width, height, initValue) {
        const gl = this.renderer.gl;

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
    
        if (initValue != null) {
            const initialData = new Float32Array(4 * width * height);
            initialData.fill(initValue);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, initialData);
        } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, null);
        }
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return {texture, framebuffer};
    }

    deleteFramebuffer(frame) {
        const gl = this.renderer.gl;

        gl.deleteTexture(frame.texture);
        gl.deleteFramebuffer(frame.framebuffer);
    }

    resize(width, height) {
        this.size = {width, height};

        if (this.isDouble) {
            this.frameId = 0;
            this.deleteFramebuffer(this.frame[0]);
            this.deleteFramebuffer(this.frame[1]);
            this.frame[0] = this.createFramebuffer(width, height, this.initValue);
            this.frame[1] = this.createFramebuffer(width, height, this.initValue);
            this.texture = this.frame[1].texture;
        } else {
            this.deleteFramebuffer(this.frame);
            this.frame = this.createFramebuffer(width, height, this.initValue);
            this.texture = this.frame.texture;
        }
    }

    render(clearColor) {
        const currentFrame = this.isDouble ? this.frame[this.frameId] : this.frame;

        this.renderer.resize(this.size.width, this.size.height);
        this.renderer.uniforms["resolution"] = [this.size.width, this.size.height];
        this.renderer.render({
            framebuffer: currentFrame.framebuffer,
            clearColor: clearColor,
        })

        this.texture = currentFrame.texture;
        if (this.isDouble) this.frameId = 1 - this.frameId;
    }

    clearColor(color) {
        const currentFrame = this.isDouble ? this.frame[this.frameId] : this.frame;
        this.renderer.clearColor(currentFrame.framebuffer, color);
        this.texture = currentFrame.texture;
        if (this.isDouble) this.frameId = 1 - this.frameId;
    }
}