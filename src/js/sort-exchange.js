"use strict";

require("three/examples/js/controls/OrbitControls");
var delay = require("./util.js").delay;

(()=>{
    var helperSwitch = false;
    var controlSwitch = true;
    var baseN = 2;
    var dataLen = 100;
    var speed = 1;

    var renderer = new THREE.WebGLRenderer();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    var scene = new THREE.Scene();
    var cubeGroup = new THREE.Group();

    var axisHelper = new THREE.AxisHelper(baseN*dataLen+5);
    var camerahelper = new THREE.CameraHelper(camera);
    var spotlightHelper;

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    var spotLight = new THREE.SpotLight(0xffffff, 2);
    var spotLightTarget = new THREE.Object3D();

    var runButton = document.getElementById("run");
    var resetButton = document.getElementById("reset");
    var speedToggle = document.getElementById("speed");
    var inputDisabled = false; 

    init();
    render();

    function init() {

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.gammaInput = true;
        renderer.gammaOutput = true;

        camera.position.set(baseN*dataLen/2, baseN*dataLen*0.3, baseN*dataLen*0.45);
        
        cubeGroupGen (dataLen);
        
        /*create floor*/
        let matFloor = new THREE.MeshPhongMaterial();
        let geoFloor = new THREE.BoxGeometry(baseN*dataLen*5, 1, baseN*dataLen*5);
        let mshFloor = new THREE.Mesh(geoFloor, matFloor);
        matFloor.color.set(0x888888);
        mshFloor.position.set(baseN*dataLen/2, -0.5, 0);
        mshFloor.receiveShadow = true;

        spotLight.position.set(baseN*dataLen/2, baseN*dataLen/4, baseN*dataLen*5/4);
        spotLightTarget.position.set(baseN*dataLen/2, baseN*dataLen/4, 0);
        spotLight.target = spotLightTarget;
        spotLight.castShadow = true;
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.5;
        spotLight.decay = 1.8;
        spotLight.distance = baseN*dataLen*2.5;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.camera.near = baseN*dataLen/4;
        spotLight.shadow.camera.far = baseN*dataLen*5/4;
        spotlightHelper = new THREE.SpotLightHelper(spotLight);

        scene.background = new THREE.Color(0x222222);
        scene.add(camera);
        scene.add(ambientLight);
        scene.add(spotLight);
        scene.add(spotLight.target);
        scene.add(cubeGroup);
        scene.add(mshFloor);

        if (helperSwitch) {
            scene.add(camerahelper);
            scene.add(axisHelper);
            scene.add(spotlightHelper);
        }
        
        document.body.appendChild(renderer.domElement);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        if (controlSwitch) {
            controls.addEventListener("change", render);
        }
        controls.minDistance = 50;
        controls.maxDistance = baseN*dataLen*5;
        controls.maxPolarAngle = Math.PI / 2;
        controls.enablePan = false;
        controls.target.copy(spotLightTarget.position);
        controls.update();


        window.addEventListener("resize", ()=>{
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            render();
        }, false);

        runButton.addEventListener("click", ()=>{
            if (!inputDisabled) {
                exchangeSort(cubeGroup.children).then((obj)=> {
                    disabled(false);
                });
            }
            disabled(true);
        }, false);
        
        resetButton.addEventListener("click", ()=>{
            if (!inputDisabled) {
                cubeGroupGen (dataLen);
                render();
            }
        }, false);
        
        speedToggle.addEventListener("change", (e)=>{
            if (!inputDisabled){
                speed = e.target.checked ? 8 : 1;
            }
        }, false);
    }
    
    function disabled (b){
        inputDisabled = b;
        runButton.disabled = b;
        resetButton.disabled = b;
        speedToggle.disabled = b;
        speedToggle.parentElement.classList.toggle('disabled');
        speedToggle.parentElement.tabIndex = b?-1:0;
    }
    
    /*==========Obj3D part==========*/
    function render() {
        spotlightHelper.update(); // required
        renderer.render(scene, camera);
    }
    
    function cubeGroupGen(length) {
        cubeGroup.children = [];
        let unsortData = unsortDataGen(length);
        unsortData.forEach((e, i) => {
            let cube = createCube({w: baseN, h: e, d: baseN});
            Obj3DTranslate(cube, {x: (i + 1) * baseN, y: e / 2});
            cube.userData = {h: e};
            cube.receiveShadow = true;
            cube.castShadow = true;
            cubeGroup.add(cube);
        });

    }

    function Obj3DTranslate(obj, dis) {
        if (obj instanceof THREE.Object3D) {
            if(typeof dis.x === "number")
                obj.translateX(dis.x);
            if(typeof dis.y === "number")
                obj.translateY(dis.y);
            if(typeof dis.z === "number")
                obj.translateZ(dis.z);
        }
    }
    
    function createCube(size) {
        let geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
        let material = new THREE.MeshPhongMaterial({color: 0x00ff00});
        let cube = new THREE.Mesh(geometry, material);   
        return cube;
    }
    /*=====================*/
    
    function unsortDataGen(length) {
        let data = new Array(length);
        data.fill(baseN);
        data.forEach((e, i, arr)=>{
            arr[i] = e + i;
        });
        //Fisher-Yates shuffle
        let j, x, i;
        for (i = data.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = data[i - 1];
            data[i - 1] = data[j];
            data[j] = x;
        }
        
        return data;
    }

    function exchangeSort(theData) {
        let param = {
            msg: "start",
            i: 0,
            j: 1,
            data: theData,
            lightSwitch: {i: false, j: false}
        };
        return start(param);

        function start(obj) {
            return new Promise((res)=> {
                console.log(obj.msg);
                res(obj);
            }).then((obj)=> {
                obj.msg = "validate";
                return validate(obj);
            });
        }

        function validate(obj) {
            return new Promise((res)=> {
                console.log(obj.msg);
                res(obj);
            }).then((obj)=> {
                let {i: i, j: j, data: {length: length}} = obj;
                if (i < length - 1) {
                    if (j < length) {
                        obj.msg = "i_highlight";
                        obj.lightSwitch.i = true;
                        return changeColor(obj);
                    } else {
                        obj.msg = "i_off_light";
                        obj.lightSwitch.i = false;
                        return changeColor(obj);
                    }
                } else {
                    obj.msg = "end";
                    return obj;
                }
            });
        }

        function changeColor(obj) {
            return new Promise((res)=> {
                console.log(obj.msg);
                let {i: i, j: j, data: data, lightSwitch: lightSwitch} = obj;
                let i_color = lightSwitch.i ? 0xffff00 : 0x00ff00;
                let j_color = lightSwitch.j ? 0x0088ff : 0x00ff00;
                if (i < data.length) {
                    data[i].material.color = new THREE.Color(i_color);
                }
                if (j < data.length) {
                    data[j].material.color = new THREE.Color(j_color);
                }
                render();
                delay(150/speed).then(()=>{
                    res(obj);
                });
            }).then((obj)=> {
                let {msg: msg} = obj;
                if (msg === "i_highlight") {
                    obj.msg = "j_highlight";
                    obj.lightSwitch.j = true;
                    return changeColor(obj);
                } else if (msg === "j_highlight") {
                    obj.msg = "data_compare";
                    return dataCompare(obj);
                } else if (obj.msg === "i_off_light") {
                    obj.msg = "validate";
                    obj.i += 1;//next index
                    obj.j = obj.i + 1;//next compare target
                    return validate(obj);
                } else if (obj.msg === "j_off_light") {
                    obj.msg = "validate";
                    obj.j += 1;//next compare target
                    return validate(obj);
                } else if (msg === "swap_hightlight") {
                    obj.msg = "j_off_light";
                    obj.lightSwitch.j = false;
                    return changeColor(obj);
                }
            });
        }

        function dataCompare(obj) {
            return new Promise((res)=> {
                console.log(obj.msg);
                res(obj);
            }).then((obj)=> {
                let {i: i, j: j, data: data} = obj;
                if (data[j].userData.h < data[i].userData.h) {
                    obj["__swap"] = {index1:i ,index2:j};
                    obj.msg = "swap_animation";
                    return swapAnimation(obj);
                } else {
                    obj.msg = "j_off_light";
                    obj.lightSwitch.j = false;
                    return changeColor(obj);
                }
            });
        }

        function swapAnimation(obj) {
            let animateSwitch = true;
            let count = 0;
            return new Promise((res)=> {
                console.log(obj.msg);
                let {"__swap":swap , data: data} = obj;
                let clip_index1 = clipGen(data[swap.index1], data[swap.index2]);
                let clip_index2 = clipGen(data[swap.index2], data[swap.index1]);
                let mixer = new THREE.AnimationMixer();
                let action_index1 = mixer.clipAction(clip_index1, data[swap.index1]);
                let action_index2 = mixer.clipAction(clip_index2, data[swap.index2]);
                action_index1.loop = action_index2.loop = THREE.LoopOnce;
                action_index1.clampWhenFinished = action_index2.clampWhenFinished = true;
                action_index1.play();
                action_index2.play();

                mixer.addEventListener("finished", function (e) {
                    count += 1;
                    if (count === 2) {
                        animateSwitch = false;
                        res(obj);
                    }
                });

                let clock = new THREE.Clock();
                animate({mixer: mixer, clock: clock});

            }).then((obj)=> {
                obj.msg = "swap_data";
                return swapData(obj);
            });

            function animate(obj) {
                let {mixer: mixer, clock: clock} = obj;
                requestAnimationFrame(()=>{
                    mixer.update(clock.getDelta());
                    render();
                    if (animateSwitch) {
                        animate(obj);
                    }
                });
            }

            function clipGen(source, target) {
                let trackName = source.uuid+".position";
                let s_pos = source.position.clone();
                let t_pos = target.position.clone();
                let subV = new THREE.Vector3().subVectors(t_pos, s_pos);

                let offsets = [new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(0, 0, 10 * baseN),
                    new THREE.Vector3(subV.x, 0, 0),
                    new THREE.Vector3(0, 0, -10 * baseN)];

                let values = offsets.reduce(function (acc, e) {
                    let v = s_pos.add(e).toArray();
                    return acc.concat(v);
                }, []);

                let timeDelta = [0, 0.15/speed, 0.3/speed, 0.15/speed];

                let times = timeDelta.map(function (e, i, arr) {
                    if (i > 0) {
                        timeDelta[i] = e + arr[i - 1];
                        return timeDelta[i];
                    } else {
                        return e;
                    }
                });
                let track = new THREE.VectorKeyframeTrack(trackName, times, values);
                return  new THREE.AnimationClip("change_position", undefined, [track]);
            }
        }

        function swapData(obj) {
            return new Promise((res)=> {
                console.log(obj.msg);
                res(obj);
            }).then((obj)=> {
                let {"__swap":swap, data: data} = obj;
                let temp = data[swap.index1];
                data[swap.index1] = data[swap.index2];
                data[swap.index2] = temp;

                obj.msg = "swap_hightlight";
                return changeColor(obj);
            });
        }
    }
    
})();

