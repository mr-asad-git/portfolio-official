document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('.three-canvas-container');

    // Store all scenes to animate
    const scenes = [];

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const index = entry.target.dataset.index;
            if (scenes[index]) {
                scenes[index].visible = entry.isIntersecting;
            }
        });
    }, { threshold: 0.1 });

    containers.forEach((container, index) => {
        container.dataset.index = index;
        observer.observe(container);

        // Get Dimensions
        let width = container.clientWidth;
        let height = container.clientHeight;

        // Scene
        const scene = new THREE.Scene();

        // Camera
        const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 100);
        camera.position.z = 3.5;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Object (Wireframe Icosahedron)
        const geometry = new THREE.IcosahedronGeometry(1.5, 1); // Radius 1.5, Detail 1
        // Create wireframe material with green accent
        const material = new THREE.MeshBasicMaterial({
            color: 0x22c55e, // Tailwind green-500
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });

        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        // Add some random particles inside
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 20;
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 4;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.05,
            color: 0x4ade80, // green-400
            transparent: true,
            opacity: 0.4
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // Store Scene Data
        const sceneData = {
            scene: scene,
            camera: camera,
            renderer: renderer,
            mesh: sphere,
            particles: particlesMesh,
            container: container,
            visible: false,
            hover: false,
            rotationSpeed: 0.005
        };

        scenes.push(sceneData);

        // Interaction (Hover on parent Card)
        const cardValue = container.closest('.glass'); // The main card
        if (cardValue) {
            cardValue.addEventListener('mouseenter', () => {
                sceneData.hover = true;
                // Tween opacity up
                material.opacity = 0.4;
                particlesMaterial.opacity = 0.8;
                sceneData.rotationSpeed = 0.02; // Faster spin

                // Scale up slightly
                sphere.scale.set(1.1, 1.1, 1.1);
            });

            cardValue.addEventListener('mouseleave', () => {
                sceneData.hover = false;
                // Tween opacity down
                material.opacity = 0.15;
                particlesMaterial.opacity = 0.4;
                sceneData.rotationSpeed = 0.005; // Normal spin

                // Scale down
                sphere.scale.set(1, 1, 1);
            });

            // Mouse move effect (Tilt)
            cardValue.addEventListener('mousemove', (e) => {
                if (!sceneData.hover) return;

                const rect = cardValue.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                // Subtle tilt
                sphere.rotation.x = y * 0.5;
                sphere.rotation.y = x * 0.5;
            });
        }

        // Handle Resize
        const resizeObserver = new ResizeObserver(() => {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;

            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        });

        resizeObserver.observe(container);
    });

    // Animation Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        scenes.forEach(data => {
            if (!data.visible) return;

            // Constant rotation
            if (!data.hover) {
                // Auto rotate if not hovering (mouse move handles rotation on hover mostly, but let's keep spinning)
                data.mesh.rotation.y += data.rotationSpeed;
                data.mesh.rotation.x += data.rotationSpeed * 0.5;
            } else {
                // Spin faster on hover, but we also drift it in mousemove. 
                // Let's just add to rotation to keep it spinning while tilting
                data.mesh.rotation.y += data.rotationSpeed;
            }

            // Pulse particles
            data.particles.rotation.y -= data.rotationSpeed * 0.5;
            // data.particles.visible = Math.sin(elapsedTime) > 0; // Blink? Nah.

            data.renderer.render(data.scene, data.camera);
        });
    }

    animate();
});
