import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { ModelInfo } from "../types/heritage";

export default function ThreeDViewer({ model }: { model: Pick<ModelInfo, "local_url"> }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let frame = 0;
    let modelRoot: THREE.Group | null = null;
    setLoading(true);
    setError("");

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#e8e1d5");
    const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.setAttribute("aria-label", "Interactive three-dimensional heritage object. Drag to rotate and scroll to zoom.");
    renderer.domElement.tabIndex = 0;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xfffbf2, 0x74634d, 2.5));
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(4, 6, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xd9b980, 1.4);
    fill.position.set(-4, 2, -3);
    scene.add(fill);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.autoRotate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    controls.autoRotateSpeed = 0.45;
    controls.listenToKeyEvents(renderer.domElement);
    controls.target.set(0, 0, 0);

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    new GLTFLoader().load(
      model.local_url,
      (gltf) => {
        if (disposed) {
          gltf.scene.traverse((item) => {
            if (item instanceof THREE.Mesh) {
              item.geometry.dispose();
              const materials = Array.isArray(item.material) ? item.material : [item.material];
              materials.forEach((material) => {
                Object.values(material).forEach((value) => {
                  if (value instanceof THREE.Texture) value.dispose();
                });
                material.dispose();
              });
            }
          });
          return;
        }
        modelRoot = gltf.scene;
        const bounds = new THREE.Box3().setFromObject(modelRoot);
        if (bounds.isEmpty()) {
          setError("The local GLB file contains no visible model.");
          setLoading(false);
          return;
        }
        const center = bounds.getCenter(new THREE.Vector3());
        modelRoot.position.sub(center);
        const sphere = bounds.getBoundingSphere(new THREE.Sphere());
        const radius = Math.max(sphere.radius, 0.1);
        camera.position.set(radius * 2.4, radius * 1.6, radius * 2.4);
        camera.near = Math.max(radius / 1000, 0.001);
        camera.far = radius * 100;
        camera.updateProjectionMatrix();
        controls.minDistance = radius * 0.35;
        controls.maxDistance = radius * 12;
        scene.add(modelRoot);
        controls.update();
        setLoading(false);
      },
      undefined,
      () => {
        if (disposed) return;
        setError(`Could not load ${model.local_url}. Check that the GLB is in frontend/public/models/.`);
        setLoading(false);
      }
    );

    const animate = () => {
      if (disposed) return;
      frame = window.requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      modelRoot?.traverse((item) => {
        if (item instanceof THREE.Mesh) {
          item.geometry.dispose();
          const materials = Array.isArray(item.material) ? item.material : [item.material];
          materials.forEach((material) => {
            Object.values(material).forEach((value) => {
              if (value instanceof THREE.Texture) value.dispose();
            });
            material.dispose();
          });
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [model.local_url]);

  return (
    <div className="viewer-frame">
      <div ref={mountRef} className="viewer-mount" />
      {loading && !error && <p className="viewer-loading">Bringing the object into view…</p>}
      {error && <p className="viewer-error">{error}</p>}
      <p className="viewer-controls">Drag to turn <span>·</span> Scroll to come closer</p>
    </div>
  );
}
