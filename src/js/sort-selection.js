"use strict";

require("three/examples/js/controls/OrbitControls");
var delay = require("./util.js").delay;

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
    var selectorGroup = new THREE.Group();

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

    var clock_loop = new THREE.Clock();
    var mixers_loop = [];

    init();
    render();
    doAnimate();

    function init() {

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.gammaInput = true;
        renderer.gammaOutput = true;

        camera.position.set(baseN * dataLen / 2, baseN * dataLen * 0.3, baseN * dataLen * 0.45);

        cubeGroupGen(dataLen);
        createSelection();

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
        scene.add(selectorGroup);
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
                selectionSort(cubeGroup.children).then((obj) => {
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
        speedToggle.parentElement.tabIndex = b?-1:0;
        
    }

    /*==========Obj3D part==========*/
    function render() {
        spotlightHelper.update(); // required
        selectorGroup.children[0].geometry.attributes.position.needsUpdate = true; // required
        renderer.render(scene, camera);
    }

    function doAnimate() {
        requestAnimationFrame(() => {
            mixers_loop.forEach((mixer, i) => {
                mixer.update(clock_loop.getDelta());
                if (i === mixers_loop.length - 1) {
                    render();
                    doAnimate();
                }
            });
        });
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

    function createSelection() {
        var edges = new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(baseN, baseN, baseN));
        let line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0xff0000, linewidth: 1}));
        getBoxEdgesPointsBufferIndexs([0, 1, 4, 5], (i) => {
            line.geometry.attributes.position.setY(i, 0);
        });

        let cone_geo = new THREE.ConeGeometry(baseN / 2, baseN, 4, 1);
        cone_geo.rotateZ(Math.PI);
        let cone = new THREE.Mesh(cone_geo, new THREE.MeshPhongMaterial({color: 0xff0000}));
        cone.translateY(baseN);
        animate_spinY(cone);

        let arrowShape = new THREE.Shape();
        arrowShape.moveTo(0, 0);
        arrowShape.lineTo(1, -2);
        arrowShape.lineTo(0.5, -2);
        arrowShape.lineTo(0.5, -3);
        arrowShape.lineTo(-0.5, -3);
        arrowShape.lineTo(-0.5, -2);
        arrowShape.lineTo(-0.5, -2);
        arrowShape.lineTo(-1, -2);
        arrowShape.lineTo(0, 0);
        let shape_geo = new THREE.ShapeGeometry(arrowShape);
        shape_geo.translate(0, -1, 0);
        shape_geo.rotateX(-Math.PI / 2);
        let arrow = new THREE.Mesh(shape_geo, new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide}));
        selectorGroup.add(line, arrow, cone);

        function animate_spinY(source) {
            let trackName = source.uuid + ".quaternion";
            let values = [];
            let times = [];
            for (let i = 0; i < 9; i++) {
                let quaternion = new THREE.Quaternion();
                quaternion.setFromEuler(new THREE.Euler(0, 2 * Math.PI * i / 8, 0, "YXZ"));
                Array.prototype.push.apply(values, quaternion.toArray());
                times.push(i / 4);
            }

            let track = new THREE.QuaternionKeyframeTrack(trackName, times, values);
            let clip = new THREE.AnimationClip("spinY", undefined, [track]);
            let mixer = new THREE.AnimationMixer();
            let action = mixer.clipAction(clip, source);
            action.clampWhenFinished = true;
            action.play();

            mixers_loop.push(mixer);
        }
    }

    function getBoxEdgesPointsBufferIndexs(pointIndexs, callback) {
        let bufferIndexs = getBufferIndexs(pointIndexs);
        bufferIndexs.forEach((v) => {
            callback(v);
        });

        function getBufferIndexs(indexs) {
            let bufferIndexMap = {
                0: [0, 2, 18],
                1: [3, 6, 16],
                2: [1, 4, 20],
                3: [5, 7, 22],
                4: [8, 10, 17],
                5: [11, 14, 19],
                6: [9, 12, 23],
                7: [13, 15, 21]
            };
            let result = [];
            indexs.forEach((v) => {
                Array.prototype.push.apply(result, bufferIndexMap[v]);
            });
            return result;
        }
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

    function selectionSort(theData) {
        let param = {
            msg: "start",
            i: 0,
            j: 1,
            data: theData,
            min: {index: 0, value: 0},
            lightSwitch: {i: false, j: false}
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
                let {msg: msg, i: i, j: j, data: data} = obj;
                if (i < data.length - 1) {
                    if (j - i === 1) {
                        if (msg !== "selector_initialized") {
                            obj.msg = "selector_initialize";
                            return selector(obj);
                        }
                    }
                    if (j < data.length) {
                        obj.msg = "i_highlight";
                        obj.lightSwitch.i = true;
                        return changeColor(obj);
                    } else {
                        obj["__swap"] = {index1: obj.min.index, index2: i};
                        obj.msg = "swap_animation";
                        return swapAnimation(obj);
                    }
                } else {
                    obj.msg = "end";
                    return obj;
                }
            });
        }

        function selector(obj) {
            return new Promise((res) => {
                console.log(obj.msg);
                res(obj);
            }).then((obj) => {
                let {msg: msg, i: i, j: j, data: data} = obj;
                if (msg === "selector_initialize") {
                    updateSelection(data[i]);
                    obj.min.index = i;
                    obj.min.value = data[i].userData.h;
                    obj.msg = "selector_initialized";
                    return validate(obj);
                } else if (msg === "selector_update") {
                    updateSelection(data[j]);
                    obj.min.index = j;
                    obj.min.value = data[j].userData.h;
                    obj.msg = "j_off_light";
                    obj.lightSwitch.j = false;
                    return changeColor(obj);
                }
            });

            function updateSelection(target) {
                let pos = target.position.clone();
                pos.setY(target.userData.h);
                selectorGroup.position.copy(pos);
                getBoxEdgesPointsBufferIndexs([2, 3, 6, 7], (i) => {
                    selectorGroup.children[0].geometry.attributes.position.setY(i, -pos.y);
                });
                selectorGroup.children[1].position.setY(-pos.y + 1);
            }
        }

        function changeColor(obj) {
            return new Promise((res) => {
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
                if (obj.msg === "min_index_offlight") {
                    data[obj.min.index].material.color = new THREE.Color(i_color);
                }
                render();
                delay(150 / speed).then(() => {
                    res(obj);
                });
            }).then((obj) => {
                let {msg: msg} = obj;
                if (msg === "i_highlight") {
                    obj.msg = "j_highlight";
                    obj.lightSwitch.j = true;
                    return changeColor(obj);
                } else if (msg === "j_highlight") {
                    obj.msg = "data_compare";
                    return dataCompare(obj);
                } else if (obj.msg === "min_index_offlight") {
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
            return new Promise((res) => {
                console.log(obj.msg);
                res(obj);
            }).then((obj) => {
                let {min: min, j: j, data: data} = obj;
                if (data[j].userData.h < min.value) {
                    obj.msg = "selector_update";
                    return selector(obj);
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
            return new Promise((res) => {
                console.log(obj.msg);
                let {"__swap": swap, data: data} = obj;
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

            }).then((obj) => {
                obj.msg = "swap_data";
                return swapData(obj);
            });

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

            function clipGen(source, target) {
                let trackName = source.uuid + ".position";
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

                let timeDelta = [0, 0.15 / speed, 0.4 / speed, 0.15 / speed];

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
            return new Promise((res) => {
                console.log(obj.msg);
                res(obj);
            }).then((obj) => {
                let {"__swap": swap, data: data} = obj;
                let temp = data[swap.index1];
                data[swap.index1] = data[swap.index2];
                data[swap.index2] = temp;

                obj.msg = "min_index_offlight";
                obj.lightSwitch.i = false;
                return changeColor(obj);
            });
        }
    }

})();

