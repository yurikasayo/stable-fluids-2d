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

        window.addEventListener('resize', this.resize.bind(this));
        window.addEventListener('mousemove', e => this.mousemove(e));

        if (this.debug) {
            this.setDebug();
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
        if (!this.mouse) {
            this.mouse = {
                x: e.x,
                y: window.innerHeight - e.y,
            };
        }

        this.mouse = {
            x: e.x,
            y: window.innerHeight - e.y,
            dx: e.x - this.mouse.x, 
            dy: (window.innerHeight - e.y) - this.mouse.y,
        };

        this.simulator.add(
            [this.mouse.dx, this.mouse.dy, 0.0, 0.0],
            [this.mouse.x / window.innerWidth, this.mouse.y / window.innerHeight]
        );
    }

    loop() {
        requestAnimationFrame(this.loop.bind(this));

        if (this.debug) {
            this.stats.end();
            this.stats.begin();
        }
        this.simulator.render();
        this.display.setTexture(this.simulator.velocity.texture);
        this.display.render();
    }

    setDebug() {
        this.gui = new GUI();
        this.gui.add(this.simulator.param, "iteration").min(5).max(20).step(1);
        this.gui.add(this.simulator.param, "viscosity").min(1e-6).max(1e-2).step(1e-5);
        this.gui.add(this.simulator.param, "rho").min(1).max(1000).step(1);
        

        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
    }
}