import GUI from 'lil-gui';
import * as Stats from 'stats-js';
import { Renderer } from './webgl/renderer';
import { Display } from './display';
import { Simulator } from './simulator';

export class MyApp {
    constructor(canvas, debug) {
        this.canvas = canvas;
        this.debug = debug;

        this.setSize();

        this.renderer = new Renderer(canvas);
        this.display = new Display(this.renderer, canvas.width, canvas.height);
        this.simulator = new Simulator(this.renderer, this.textureSize);

        this.mouse = {x: 0, y: 0, dx: 0, dy: 0, down: false};
        window.addEventListener('resize', this.resize.bind(this));
        this.canvas.addEventListener('mousemove', e => this.mousemove(e));
        this.canvas.addEventListener('mousedown', this.mousedown.bind(this));
        this.canvas.addEventListener('mouseup', this.mouseup.bind(this));
        this.canvas.addEventListener('touchmove', e => this.touchmove(e));

        this.setGui();
        if (this.debug) {
            this.setStats();
        }

        this.loop();
    }

    setSize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const pixelRatio = Math.min(window.devicePixelRatio, 2);

        this.canvas.width = Math.floor(width * pixelRatio);
        this.canvas.height = Math.floor(height * pixelRatio);

        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        this.textureSize = {
            width: Math.floor(this.canvas.width / 4.0),
            height: Math.floor(this.canvas.height / 4.0)
        };
    }

    resize() {
        this.setSize();
        this.display.resize(this.canvas.width, this.canvas.height);
        this.simulator.resize(this.textureSize);
    }

    mousemove(e) {
        this.mouse.x = e.x;
        this.mouse.y = window.innerHeight - e.y;
        this.mouse.dx = e.movementX;
        this.mouse.dy = -e.movementY;

        this.simulator.addForce(
            [this.mouse.dx * window.innerWidth / window.innerHeight, this.mouse.dy, 0.0, 0.0],
            [this.mouse.x / window.innerWidth, this.mouse.y / window.innerHeight]
        );

        if (this.mouse.down == true) {
            this.simulator.addSource(
                [0.1 * Math.sqrt(this.mouse.dx * this.mouse.dx + this.mouse.dy * this.mouse.dy), 0.0, 0.0, 0.0],
                [this.mouse.x / window.innerWidth, this.mouse.y / window.innerHeight]
            )
        }
    }

    mousedown() {
        this.mouse.down = true;
    }

    mouseup() {
        this.mouse.down = false;
    }

    touchmove(e) {
        e.preventDefault();
    }

    loop() {
        requestAnimationFrame(this.loop.bind(this));

        if (this.debug) {
            this.stats.end();
            this.stats.begin();
        }
        this.simulator.simulate();
        switch(this.guiObject.display) {
            case "velocity":
                this.display.setTexture(this.simulator.velocity.texture);
                break;
            case "density":
                this.display.setTexture(this.simulator.density.texture);
                break;
            case "pressure":
                this.display.setTexture(this.simulator.pressure.texture);
        }
        this.display.render();
    }

    setGui() {
        this.gui = new GUI();
        this.guiObject = {display: "velocity"};
        this.gui.add(this.guiObject, "display", ["velocity", "density", "pressure"]);
        this.gui.add(this.display.param, "colorMode").min(0).max(3).step(1);
        this.gui.add(this.simulator.param, "iteration").min(1).max(20).step(1);
        this.gui.add(this.simulator.param, "viscosity").min(1e-4).max(1e-2).step(1e-4);
        this.gui.add(this.simulator.param, "rho").min(10).max(1000).step(1);
    }

    setStats() {
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
    }
}