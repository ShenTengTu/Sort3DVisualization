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
                mergeSort(cubeGroup.children).then((obj) => {
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
            cube.userData = {h: e, prevPos: cube.position.clone()};
            cube.receiveShadow = true;
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

    function mergeSort(theData) {
        let divideLevel = Math.ceil(Math.log2(theData.length));
        let divideSlices = new Array(divideLevel);
        let param = {
            msg: "do_divide",
            i: 0,
            j: 0,
            data: theData.slice(),
            lightSwitch: {shift_prev: false, shift: false}
        };
        return doDivide(param);

        function doDivide(obj) {
            return new Promise((res) => {
                console.log(obj.msg);
                delay(100 / speed).then(() => {
                    res(obj);
                });
            }).then((obj) => {

                let {i: i, j: j, data: data} = obj;
                if (i < divideLevel) {
                    if (divideSlices[i] === undefined) {
                        divideSlices[i] = [];
                    }

                    if (i === 0) {
                        divide(data, divideSlices[i]);
                        obj.i += 1;
                        return doDivide(obj);
                    } else {
                        if (j < divideSlices[i - 1].length) {
                            divide(divideSlices[i - 1][j], divideSlices[i]);
                            obj.j += 1;
                            return doDivide(obj);
                        } else {
                            obj.j = 0;
                            obj.i += 1;
                            return doDivide(obj);
                        }
                    }
                } else {
                    obj.msg = "do_sort";
                    obj.i -= 1;
                    obj.j = 0;
                    return doSort(obj);
                }

            });

            function divide(arr, container) {
                let l = arr.length;
                let slices = (l > 1) ?
                        [arr.slice(0, l / 2), arr.slice(l / 2, l)] : [null, null];
                if (slices[0]) {
                    slices[0].forEach((e) => {
                        let hex = obj.i !== (divideLevel - 1) ? 0x00ff00 : 0xcc6699;
                        e.material.color = new THREE.Color(hex);
                        render();
                    });
                }
                if (slices[1]) {
                    slices[1].forEach((e) => {
                        let hex = obj.i !== (divideLevel - 1) ? 0xcc33ff : 0xcc77ff;
                        e.material.color = new THREE.Color(hex);
                        render();
                    });
                }
                Array.prototype.push.apply(container, slices);
            }
        }

        function doSort(obj) {
            return new Promise((res) => {
                console.log(obj.msg);
                let {i: i, j: j} = obj;
                if (i >= 0) {
                    let curr = divideSlices[i];
                    let prev = (i - 1) >= 0 ? divideSlices[i - 1] : [obj.data];
                    if (j < prev.length) {
                        obj.full = prev[j];
                        obj.left = curr[j * 2];
                        obj.right = curr[j * 2 + 1];
                        obj.f = 0;
                        obj.l = 0;
                        obj.r = 0;

                        if (obj.left && obj.right) {
                            movefoward(obj.left, obj.right);
                            obj.msg = "do_compare";
                            delay(250 / speed).then(() => {
                                res(obj);
                            });
                        } else {
                            obj.j += 1;
                            res(obj);
                        }
                    } else {
                        obj.i -= 1;
                        obj.j = 0;
                        res(obj);
                    }
                } else {
                    obj.data.forEach((e, i) => {
                        e.userData.prevPos = e.position.clone();
                        theData[i] = e;
                    });
                    obj.msg = "end";
                    res(obj);
                }
            }).then((obj) => {
                let {msg: msg} = obj;
                if (msg === "do_compare") {
                    return doCompare(obj);
                } else if (msg === "do_sort") {
                    return doSort(obj);
                } else if (msg === "end") {
                    return obj;
                }
            });

            function movefoward(left, right) {
                left.forEach((e) => {
                    Obj3DTranslate(e, {y: 16, z: 16});
                });
                right.forEach((e) => {
                    Obj3DTranslate(e, {y: 16, z: 16});
                });
                render();
            }
        }

        function doCompare(obj) {
            return new Promise((res) => {
                console.log(obj.msg);
                let {full: full, left: left, right: right, f: f, l: l, r: r} = obj;
                let hex = obj.j % 2 === 0 ? 0x00ff00 : 0xcc33ff;

                if (l < left.length && r < right.length) {
                    if (left[l].userData.h < right[r].userData.h) {
                        animate_move(left[l], full[f], 0.15 / speed, () => {
                            left[l].material.color = new THREE.Color(hex);
                            obj.full[obj.f++] = left[obj.l++];
                            render();
                            res(obj);
                        });
                    } else {
                        animate_move(right[r], full[f], 0.15 / speed, () => {
                            right[r].material.color = new THREE.Color(hex);
                            obj.full[obj.f++] = right[obj.r++];
                            render();
                            res(obj);
                        });
                    }
                } else {
                    obj.msg = "do_fill";
                    obj.fill = "left";
                    res(obj);
                }

            }).then((obj) => {
                let {msg: msg} = obj;
                if (msg === "do_compare") {
                    return doCompare(obj);
                } else if (msg === "do_fill") {
                    return doFill(obj);
                }
            });

        }

        function doFill(obj) {
            return new Promise((res) => {
                console.log(obj.msg);
                let {full: full, left: left, right: right, f: f, l: l, r: r, fill: fill} = obj;
                let hex = obj.j % 2 === 0 ? 0x00ff00 : 0xcc33ff;

                if (fill === "left") {
                    if (l < left.length) {
                        animate_move(left[l], full[f], 0.15 / speed, () => {
                            left[l].material.color = new THREE.Color(hex);
                            obj.full[obj.f++] = left[obj.l++];
                            render();
                            res(obj);
                        });
                    } else {
                        obj.fill = "right";
                        res(obj);
                    }
                } else if (fill === "right") {
                    if (r < right.length) {
                        animate_move(right[r], full[f], 0.15 / speed, () => {
                            right[r].material.color = new THREE.Color(hex);
                            obj.full[obj.f++] = right[obj.r++];
                            render();
                            res(obj);
                        });
                    } else {
                        obj.msg = "do_sort";
                        obj.j += 1;
                        res(obj);
                    }
                }

            }).then((obj) => {
                let {msg: msg} = obj;
                if (msg === "do_fill") {
                    return doFill(obj);
                } else if (msg === "do_sort") {
                    return doSort(obj);
                }
            });
        }

        function animate_move(source, target, timeDelta, callback) {
            let animateSwitch = true;
            let trackName = source.uuid + ".position";
            let s_pos = source.position.clone();
            let t_pos = target.userData.prevPos;
            let translateVector = new THREE.Vector3().subVectors(t_pos, s_pos).setY(-16).setZ(-16);

            let offsets = [new THREE.Vector3(0, 0, 0), translateVector];
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

            mixer.addEventListener("finished", function (e) {
                animateSwitch = false;
                if (isFunction(callback)) {
                    callback();
                }
            });

            animate({mixer: mixer, clock: new THREE.Clock()});

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

})();

