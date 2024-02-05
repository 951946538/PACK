import * as THREE from "../js/three.module.js"
import { OrbitControls } from "../js/OrbitControls.js"
import { PLYLoader } from "../js/PLYLoader.js"
import Stats from '../js/stats.module.js'


const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5))

const light = new THREE.SpotLight()
light.position.set(20, 20, 20)
scene.add(light)

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
)
camera.position.z = 600

const renderer = new THREE.WebGLRenderer()
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true



const loader = new PLYLoader()


var script = document.getElementsByTagName('script')

let filePATH =  script[script.length - 1].getAttribute('path')
console.log(filePATH)
//"{{path}}"

loader.load(
    filePATH,
    function (geometry) {
        geometry.center()
        const material = new THREE.PointsMaterial( { size: 0.001, vertexColors: true } ); 
        const object = new THREE.Points( geometry, material );
        object.name = filePATH
        /** L'objet est fixe selon un cote sur le centre, il faut pouvoir centre l'image */

        //object.position.z = 0// blue axes

        //object.position.y = -50 // green axes
        //object.position.x =-200  // red axes

        object.rotateZ(-1.5708) // = -pi
        
        scene.add(object)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)



window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const stats = Stats()
document.body.appendChild(stats.dom)

function animate() {
    requestAnimationFrame(animate)

    controls.update()

    render()

    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

animate()
