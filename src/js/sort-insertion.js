"use strict";

require("three/examples/js/controls/OrbitControls");
var delay = require("./util.js").delay;
var isFunction = require("./util.js").isFn;

(() => {
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

    var axisHelper = new THREE.AxisHelper(baseN * dataLen + 5);
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

        camera.position.set(baseN * dataLen / 2, baseN * dataLen * 0.3, baseN * dataLen * 0.45);

        cubeGroupGen(dataLen);

        /*create floor*/
        let matFloor = new THREE.MeshPhongMaterial();
        let geoFloor = new THREE.BoxGeometry(baseN * dataLen * 5, 1, baseN * dataLen * 5);
        let mshFloor = new THREE.Mesh(geoFloor, matFloor);
        matFloor.color.set(0x888888);
        mshFloor.position.set(baseN * dataLen / 2, -0.5, 0);
        mshFloor.receiveShadow = true;

        spotLight.position.set(baseN * dataLen / 2, baseN * dataLen / 4, baseN * dataLen * 5 / 4);
        spotLightTarget.position.set(baseN * dataLen / 2, baseN * dataLen / 4, 0);
        spotLight.target = spotLightTarget;
        spotLight.castShadow = true;
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.5;
        spotLight.decay = 1.8;
        spotLight.distance = baseN * dataLen * 2.5;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.camera.near = baseN * dataLen / 4;
        spotLight.shadow.camera.far = baseN * dataLen * 5 / 4;
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
        controls.maxDistance = baseN * dataLen * 5;
        controls.maxPolarAngle = Math.PI / 2;
        controls.enablePan = false;
        controls.target.copy(spotLightTarget.position);
        controls.update();


        window.addEventListener("resize", () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            render();
        }, false);

        runButton.addEventListener("click", () => {
            if (!inputDisabled) {
                insertionSort(cubeGroup.children).then((obj) => {
                    disabled(false);
                });
            }
            disabled(true);
        }, false);

        resetButton.addEventListener("click", () => {
            if (!inputDisabled) {
                cubeGroupGen(dataLen);
                render();
            }
        }, false);

        speedToggle.addEventListener("change", (e) => {
            if (!inputDisabled) {
                speed = e.target.checked ? 8 : 1;
            }
        }, false);
    }

    function disabled(b) {
        inputDisabled = b;
        runButton.disabled = b;
        resetButton.disabled = b;
        speedToggle.disabled = b;
        speedToggle.parentElement.classList.toggle('disabled');
        speedToggle.parentElement.tabIndex = b ? -1 : 0;

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
            cube.castShadow = true;
            cubeGroup.add(cube);
        });

    }

    function Obj3DTranslate(obj, dis) {
        if (obj instanceof THREE.Object3D) {
            if (typeof dis.x === "number")
                obj.translateX(dis.x);
            if (typeof dis.y === "number")
                obj.translateY(dis.y);
            if (typeof dis.z === "number")
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
        data.forEach((e, i, arr) => {
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

    function insertionSort(theData) {
        let param = {
            msg: "start",
            i: 1,
            shift: 1,
            data: theData,
            inserts: undefined,
            lightSwitch: {shift_prev: false, shift: false}
        };
        return start(param);

        function start(obj) {
            return new Promise((res) => {
                console.log(obj.msg);
                res(obj);
            }).then((obj) => {
                obj.msg = "validate";
                return validate(obj);
            });
        }

        function validate(obj) {
            return new Promise((res) => {
                console.log(obj.msg);
                res(obj);
            }).then((obj) => {
                let {msg: msg, i: i, shift: shift, data: data} = obj;
                if (i < data.length) {
                    if (shift === i) {
                        if (msg !== "inserts_picked_up") {
                            obj.msg = "shift_highlight";
                            obj.lightSwitch.shift = true;
                            return changeColor(obj);
                        }
                    }
                    if (shift > 0) {
                        obj.msg = "shift_prev_highlight";
                        obj.lightSwitch.shift_prev = true;
                        return changeColor(obj);
                    } else {
                        obj.msg = "insert_animation";
                        return moveAnimation(obj);
                    }
                } else {
                    obj.msg = "end";
                    return obj;
                }
            });
        }

        function changeColor(obj) {
            return new Promise((res) => {
                console.log(obj.msg);
                let {shift: shift, data: data, lightSwitch: lightSwitch} = obj;
                let shift_prev_color = lightSwitch.shift_prev ? 0xffff00 : 0x00ff00;
                let shift_color = lightSwitch.shift ? 0x0088ff : 0x00ff00;
                if ((shift - 1) < data.length && shift > 0) {
                    data[shift - 1].material.color = new THREE.Color(shift_prev_color);
                }
                if (shift < data.length) {
                    data[shift].material.color = new THREE.Color(shift_color);
                }
                render();
                delay(150 / speed).then(() => {
                    res(obj);
                });
            }).then((obj) => {
                let {msg: msg, shift: shift} = obj;
                if (msg === "shift_highlight") {
                    obj.msg = "pick_up_animation";
                    return moveAnimation(obj);
                } else if (msg === "shift_prev_highlight") {
                    obj.msg = "data_compare";
                    return dataCompare(obj);
                } else if (msg === "shift_prev_off_light") {
                    if (obj.__compare) {
                        obj.data[shift] = obj.data[shift - 1];
                        obj.data[shift - 1] = obj.inserts;
                        obj.shift -= 1;
                        return validate(obj);
                    } else {
                        obj.msg = "insert_animation";
                        return moveAnimation(obj);
                    }
                } else if (msg === "shift_off_light") {
                    obj.i += 1;
                    obj.shift = obj.i;
                    return validate(obj);
                }
            });
        }

        function dataCompare(obj) {
            return new Promise((res) => {
                console.log(obj.msg);
                res(obj);
            }).then((obj) => {
                let {inserts: inserts, shift: shift, data: data} = obj;
                obj.__compare = inserts.userData.h < data[shift - 1].userData.h;
                if (obj.__compare) {
                    obj.msg = "shift_animation";
                    return moveAnimation(obj);
                } else {
                    obj.msg = "shift_prev_off_light";
                    obj.lightSwitch.shift_prev = false;
                    return changeColor(obj);
                }
            });
        }

        function moveAnimation(obj) {
            let {msg: msg, shift: shift, data: data} = obj;
            console.log(msg);
            if (msg === "pick_up_animation") {
                return animate_move(data[shift], new THREE.Vector3(0, dataLen, 0),
                        0.25 / speed, validate, (obj) => {
                    obj.msg = "inserts_picked_up";
                    obj.inserts = obj.data[obj.i];
                });
            } else if (msg === "shift_animation") {
                let shiftInserts = animate_move(obj.inserts, new THREE.Vector3(-baseN, 0, 0),
                        0.15 / speed, changeColor, (obj) => {
                    obj.msg = "shift_prev_off_light";
                    obj.lightSwitch.shift_prev = false;
                });
                return animate_move(data[shift - 1], new THREE.Vector3(baseN, 0, 0),
                        0.15 / speed, shiftInserts);
            } else if (msg === "insert_animation") {
                obj.data[shift] = obj.inserts;
                return animate_move(obj.data[shift], new THREE.Vector3(0, -dataLen, 0),
                        0.25 / speed, changeColor, (obj) => {
                    obj.msg = "shift_off_light";
                    obj.lightSwitch.shift = false;
                });
            }

            function animate_move(source, translateVector, timeDelta, nextPromise, inThenfn) {
                let animateSwitch = true;
                let trackName = source.uuid + ".position";
                let s_pos = source.position.clone();

                let offsets = [new THREE.Vector3(0, 0, 0), translateVector.clone()];
                let values = offsets.reduce((acc, e) => {
                    let v = s_pos.add(e).toArray();
                    return acc.concat(v);
                }, []);

                let timeDeltas = [0, timeDelta];
                let times = timeDeltas.map(function (e, i, arr) {
                    if (i > 0) {
                        timeDeltas[i] = e + arr[i - 1];
                        return timeDeltas[i];
                    } else {
                        return e;
                    }
                });

                let track = new THREE.VectorKeyframeTrack(trackName, times, values);
                let clip = new THREE.AnimationClip("move", undefined, [track]);
                let mixer = new THREE.AnimationMixer();
                let action = mixer.clipAction(clip, source);
                action.loop = THREE.LoopOnce;
                action.clampWhenFinished = true;
                action.play();

                return new Promise((res) => {
                    mixer.addEventListener("finished", function (e) {
                        animateSwitch = false;
                        res(obj);
                    });
                    animate({mixer: mixer, clock: new THREE.Clock()});
                }).then((obj) => {
                    if (isFunction(inThenfn)) {
                        inThenfn(obj);
                    }
                    if (isFunction(nextPromise)) {
                        return nextPromise(obj);
                    }
                    if (nextPromise instanceof Promise) {
                        return nextPromise;
                    }
                });
                ;

                function animate(obj) {
                    let {mixer: mixer, clock: clock} = obj;
                    requestAnimationFrame(() => {
                        mixer.update(clock.getDelta());
                        render();
                        if (animateSwitch) {
                            animate(obj);
                        }
                    });
                }
            }
        }

    }

})();

