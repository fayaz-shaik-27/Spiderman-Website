/**
 * Spider-Man: Brand New Day - Three.js 3D Web & Particle Background Engine
 */

class Web3DEngine {
    constructor() {
        this.container = document.getElementById('web-3d-container');
        if (!this.container) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        this.scrollProgress = 0;
        this.mouseX = 0;
        this.mouseY = 0;

        this.init();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.z = 12;

        // Build 3D Web Mesh
        this.create3DWebMesh();

        // Build 3D Web Particles
        this.create3DParticles();

        // Build 3D Spider Object
        this.create3DSpiderSymbol();

        // Event Listeners
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // Render Loop
        this.animate();
    }

    create3DWebMesh() {
        const linesGeometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];

        const color1 = new THREE.Color(0x00F0FF); // Cyan
        const color2 = new THREE.Color(0xE50914); // Red

        // Concentric Rings & Radial Web Spokes
        const spokes = 16;
        const rings = 10;
        const maxRadius = 18;

        for (let r = 1; r <= rings; r++) {
            const radius = (r / rings) * maxRadius;
            const zOffset = Math.sin(r * 0.4) * 3; // 3D Web Funnel Shape

            for (let s = 0; s < spokes; s++) {
                const angle1 = (s / spokes) * Math.PI * 2;
                const angle2 = ((s + 1) / spokes) * Math.PI * 2;

                const x1 = Math.cos(angle1) * radius;
                const y1 = Math.sin(angle1) * radius;
                const x2 = Math.cos(angle2) * radius;
                const y2 = Math.sin(angle2) * radius;

                // Ring Segment
                positions.push(x1, y1, zOffset);
                positions.push(x2, y2, zOffset);

                const lerpColor = color1.clone().lerp(color2, r / rings);
                colors.push(lerpColor.r, lerpColor.g, lerpColor.b);
                colors.push(lerpColor.r, lerpColor.g, lerpColor.b);

                // Radial Spoke Segment (connect inner to outer)
                if (r > 1) {
                    const prevRadius = ((r - 1) / rings) * maxRadius;
                    const prevZ = Math.sin((r - 1) * 0.4) * 3;
                    const px1 = Math.cos(angle1) * prevRadius;
                    const py1 = Math.sin(angle1) * prevRadius;

                    positions.push(x1, y1, zOffset);
                    positions.push(px1, py1, prevZ);

                    colors.push(lerpColor.r, lerpColor.g, lerpColor.b);
                    colors.push(lerpColor.r, lerpColor.g, lerpColor.b);
                }
            }
        }

        linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        linesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.65,
            linewidth: 2
        });

        this.webMesh = new THREE.LineSegments(linesGeometry, material);
        this.scene.add(this.webMesh);
    }

    create3DParticles() {
        const particleCount = 500;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];

        const colorCyan = new THREE.Color(0x00F0FF);
        const colorRed = new THREE.Color(0xE50914);

        for (let i = 0; i < particleCount; i++) {
            positions.push(
                (Math.random() - 0.5) * 45,
                (Math.random() - 0.5) * 45,
                (Math.random() - 0.5) * 35
            );

            const c = Math.random() > 0.5 ? colorCyan : colorRed;
            colors.push(c.r, c.g, c.b);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.18,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    create3DSpiderSymbol() {
        const group = new THREE.Group();

        // Spider Body Sphere
        const bodyGeo = new THREE.SphereGeometry(0.7, 16, 16);
        const bodyMat = new THREE.MeshBasicMaterial({ color: 0xE50914, wireframe: true });
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(bodyMesh);

        // Spider Head
        const headGeo = new THREE.SphereGeometry(0.4, 12, 12);
        const headMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF, wireframe: true });
        const headMesh = new THREE.Mesh(headGeo, headMat);
        headMesh.position.y = 0.8;
        group.add(headMesh);

        // 8 Curved 3D Spider Legs
        for (let i = 0; i < 8; i++) {
            const side = i < 4 ? -1 : 1;
            const legIndex = i % 4;
            const yOffset = (legIndex * 0.3) - 0.4;

            const legCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, yOffset, 0),
                new THREE.Vector3(side * 1.8, yOffset + 0.6, 0.6),
                new THREE.Vector3(side * 3.0, yOffset - 0.8, -0.6)
            ]);

            const legGeo = new THREE.TubeGeometry(legCurve, 12, 0.06, 8, false);
            const legMat = new THREE.MeshBasicMaterial({ color: legIndex % 2 === 0 ? 0xE50914 : 0x00F0FF });
            const legMesh = new THREE.Mesh(legGeo, legMat);
            group.add(legMesh);
        }

        this.spiderObj = group;
        this.scene.add(this.spiderObj);
    }

    setScrollProgress(progress) {
        this.scrollProgress = progress; // 0 to 1
    }

    onMouseMove(e) {
        this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        // Scroll Driven 3D Web Funnel Rotation & Depth Morphing
        if (this.webMesh) {
            this.webMesh.rotation.z = (this.scrollProgress * Math.PI * 3) + (time * 0.1);
            this.webMesh.rotation.x = Math.sin(time * 0.4) * 0.2 + (this.scrollProgress * Math.PI * 0.6);
            this.webMesh.rotation.y = Math.cos(time * 0.4) * 0.2 + (this.scrollProgress * Math.PI * 0.4);

            this.webMesh.position.z = -this.scrollProgress * 15;
        }

        // Floating 3D Web Particles Motion
        if (this.particles) {
            this.particles.rotation.y = time * 0.04 + (this.scrollProgress * Math.PI * 2);
            this.particles.rotation.x = time * 0.02;
        }

        // 3D Spider Object Motion
        if (this.spiderObj) {
            this.spiderObj.position.y = Math.sin(time * 2.5) * 0.6 - (this.scrollProgress * 6);
            this.spiderObj.rotation.z = Math.sin(time * 1.5) * 0.2;
            this.spiderObj.rotation.y = time * 0.5 + (this.scrollProgress * Math.PI * 2);
            this.spiderObj.position.z = 4 - (this.scrollProgress * 12);
        }

        // Smooth Mouse Parallax Camera Tracking
        this.camera.position.x += (this.mouseX * 3 - this.camera.position.x) * 0.05;
        this.camera.position.y += (-this.mouseY * 3 - this.camera.position.y) * 0.05;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
    }
}

window.Web3DEngine = Web3DEngine;
