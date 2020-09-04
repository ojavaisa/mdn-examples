const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);  //field of view in degrees, aspect ratio, near plane, far plane (i.e. how close/far a thing is to camera when they are no longer rendered)
camera.position.z = 5;  // set camera 5 distace units up on the z axis (out of screen towards viewer)

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); // renderer creates a canvas element, append to body

let cube;

// let geometry = new THREE.BoxGeometry(2.4, 2.4, 2.4);
// let material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
// cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

let loader = new THREE.TextureLoader();
// NOTE: This won't work on local machine due to browsers same origin policy security restictions 
// Must be run on a server (or a local server)
loader.load('metal003.png', function (texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);

    let geometry = new THREE.BoxGeometry(2.4, 2.4, 2.4);
    let material = new THREE.MeshLambertMaterial({ map: texture, shading: THREE.FlatShading });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    draw();
});

let light = new THREE.AmbientLight('rgb(255, 255, 255)');   // soft white light
scene.add(light);

let spotLight = new THREE.SpotLight('rgb(255, 255, 255)');  // white spotlight
spotLight.position.set(100, 1000, 1000);
spotLight.castShadow = true;
scene.add(spotLight);

function draw() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);

    requestAnimationFrame(draw);
}
