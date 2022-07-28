import * as glMatrix from 'gl-matrix';

export class Camera {
    constructor() {
        this.viewMatrix = glMatrix.mat4.create();
        this.projectionMatrix = glMatrix.mat4.create();
    }

    perspective(fovy, aspect, near, far) {
        glMatrix.mat4.perspective(this.projectionMatrix, fovy, aspect, near, far);
    }

    lookAt(eye, center, up) {
        glMatrix.mat4.lookAt(this.viewMatrix, eye, center, up);
        this.position = eye;
    }
}