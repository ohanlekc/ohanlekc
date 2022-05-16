import { VertexAttributes } from './vertex-attributes';
import { ShaderProgram } from './shader-program';
import { VertexArray } from './vertex-array';
import { Matrix4 } from './matrix';
import { Vector3, Vector4 } from './vector';
import { Camera } from './camera';
import { TerrainCamera } from './terraincamera';
import { Terrain } from './terrain';

let canvas;
let attributes;
let fireAttributes;
let waterAttributes;

let shaderProgram;
let fireShaderProgram;
let waterShaderProgram;

let normals = [];
let vao;
let fireVao;
let waterVao;

let clipFromEye;
let worldFromModel = Matrix4.identity();
let scale;
let greyScale;
let position = new Vector3(0, 0, 5);
let worldUp = new Vector3(0, 1, 0);
let lookAt = new Vector3(0, 0, 0);
let terrainCam;
let terrain;
let tri;

let waterPositions = [];
let waterTexPositions = [];
let waterIndices = [];

let firePositions = [];
let fireTexPositions = [];
let fireIndices = [];

function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.2, 0.4, 0.9, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Terrain
  shaderProgram.bind();

  shaderProgram.setUniformMatrix4('clipFromEye', clipFromEye);
  shaderProgram.setUniformMatrix4('eyeFromWorld', terrainCam.eyeFromWorld);
  shaderProgram.setUniformMatrix4('worldFromModel', worldFromModel);

  vao.bind();
  vao.drawIndexed(gl.TRIANGLES);
  vao.unbind();

  shaderProgram.unbind();

  // Fire
  fireShaderProgram.bind();

  fireShaderProgram.setUniformMatrix4('clipFromEye', clipFromEye);
  fireShaderProgram.setUniformMatrix4('eyeFromWorld', terrainCam.eyeFromWorld);
  fireShaderProgram.setUniformMatrix4('worldFromModel', worldFromModel);
  fireShaderProgram.setUniform1f('scale', scale);
  fireShaderProgram.setUniform1i('sampTexture', 0);

  fireVao.bind();
  fireVao.drawIndexed(gl.TRIANGLES);
  fireVao.unbind();

  // Water
  waterShaderProgram.bind();

  waterShaderProgram.setUniformMatrix4('clipFromEye', clipFromEye);
  waterShaderProgram.setUniformMatrix4('eyeFromWorld', terrainCam.eyeFromWorld);
  waterShaderProgram.setUniformMatrix4('worldFromModel', worldFromModel);
  waterShaderProgram.setUniform1f('scale', scale);
  waterShaderProgram.setUniform1i('sampTexture', 1);

  waterVao.bind();
  waterVao.drawIndexed(gl.TRIANGLES);
  waterVao.unbind();

  waterShaderProgram.unbind();

}

function onResizeWindow() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  clipFromEye = Matrix4.fovPerspective(45, canvas.width / canvas.height, 0.05, 1000);
  render();
}

async function readImage(url) {
  const image = new Image();
  image.src = url;
  console.log(url);
  await image.decode();
  return image;
}

function imageToGrayscale(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, image.width, image.height);
  const pixels = context.getImageData(0, 0, image.width, image.height);

  const grays = new Array(image.width * image.height);
  for (let i = 0; i < image.width * image.height; ++i) {
    grays[i] = pixels.data[i * 4] * .1;
  }

  return grays;
}

function createTexture2d(image, textureUnit = gl.TEXTURE0) {
  gl.activeTexture(textureUnit);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);
  return texture;
}

function onKeyDown(event) {
  let key = event.keyCode;
  let moveDelta = .8;
  switch (key) {
    case 87: // W
      terrainCam.advance(moveDelta);
      break;
    case 65: // A
      terrainCam.strafe(-moveDelta);
      break;
    case 83: // S
      terrainCam.advance(-moveDelta);
      break;
    case 68: // D
      terrainCam.strafe(moveDelta);
      break;
    default:
      break;
  }

  // Checking how close the camera is to water
  for (let i = 0; i < waterPositions.length; i+=12) {
    let position = new Vector3(waterPositions[i], waterPositions[i+1], waterPositions[i+2]);
    let XPos = Math.abs(terrainCam.position.x - position.x);
    let YPos = Math.abs(terrainCam.position.z - position.z);
    if (XPos < 1 && YPos < 1) // We have collected the water and need to delete it from the scene.
    {
      playSound();
      waterPositions[i] = 0;
      waterPositions[i+1] = 0;
      waterPositions[i+2] = 0;
      waterPositions[i+3] = 0;
      waterPositions[i+4] = 0;
      waterPositions[i+5] = 0;
      waterPositions[i+6] = 0;
      waterPositions[i+7] = 0;
      waterPositions[i+8] = 0;
      waterPositions[i+9] = 0;
      waterPositions[i+10] = 0;
      waterPositions[i+11] = 0;
      waterPositions[i+12] = 0;

      waterAttributes.addAttribute('position', waterPositions.length/3, 3, waterPositions);
      waterAttributes.addAttribute('texPosition', waterTexPositions.length/2, 2, waterTexPositions);
      waterAttributes.addIndices(waterIndices);
      updateWater(waterAttributes);

    }
  }
  render();
}

// Populate the positions, texPositions and indices arrays for the elements
function generateElements(positions, texPositions, indices) {
  let n = 100;

  for (let i = 0; i < n; i++) {
    let x = Math.random() * terrain.width;
    let z = Math.random() * terrain.depth;
    let y = terrain.blerp(x, z);

    positions.push(x + 1, y, z);
    positions.push(x + 1, y + 1, z);
    positions.push(x - 1, y, z);
    positions.push(x - 1, y + 1, z);

    texPositions.push(1, 1);
    texPositions.push(1, 0);
    texPositions.push(0, 1);
    texPositions.push(0, 0);

    indices.push(i * 4, i * 4 + 1, i * 4 + 3);
    indices.push(i * 4, i * 4 + 3, i * 4 + 2);
  }

  let newAttributes = new VertexAttributes();
  newAttributes.addAttribute('position', positions.length/3, 3, positions);
  newAttributes.addAttribute('texPosition', texPositions.length/2, 2, texPositions);
  newAttributes.addIndices(indices);
  return newAttributes;
}

// Redraw the water elements to delete the one we just collected.
function updateWater(attributes) {
  
  const eleVertexSource = `
  uniform mat4 clipFromEye;
  uniform mat4 eyeFromWorld;
  uniform mat4 worldFromModel;
  uniform float scale;
  in vec3 position;
  in vec2 texPosition;
  out vec2 mixTexPosition;

  void main() {
    gl_Position = clipFromEye * eyeFromWorld * worldFromModel * vec4(position + scale, 1.0);
    mixTexPosition = texPosition;
  }
  `;

  const eleFragmentSource = `
  uniform sampler2D sampTexture;
  in vec2 mixTexPosition;
  out vec4 fragmentColor;

  void main() {
    vec4 tex = texture(sampTexture, mixTexPosition);
    if (tex.a < 0.5) {
      discard;
    }
    else {
      fragmentColor = tex;
    }
  }
  `;

  waterShaderProgram = new ShaderProgram(eleVertexSource, eleFragmentSource);
  waterVao = new VertexArray(waterShaderProgram, attributes);
}

// Play sound
function playSound() {
  const audio = new Audio("sound.wav");
  audio.play();
}

// Move elements up and down
function animateFrame() {
  scale = Math.abs(Math.sin(performance.now() * 0.001));
  render();
  requestAnimationFrame(animateFrame);
}

async function initialize() {
  canvas = document.getElementById('canvas');
  window.gl = canvas.getContext('webgl2');

  const texImg = await readImage('noise-terrain.png');
  greyScale = imageToGrayscale(texImg);
  const fireImg = await readImage('fire.png');
  createTexture2d(fireImg,gl.TEXTURE0);
  const waterImg = await readImage('water.png');
  createTexture2d(waterImg,gl.TEXTURE1);

  terrain = new Terrain(greyScale, texImg.height, texImg.width);
  tri = terrain.toTrimesh();
  position = new Vector3(texImg.width / 2, texImg.height/2, 250);
  terrainCam = new TerrainCamera(position, lookAt, worldUp, terrain, 1.0);

  gl.enable(gl.DEPTH_TEST);

  let tmpnormals = tri.generateNormals(tri.positions, tri.indices);

  for(let i = 0; i < tmpnormals.length; i++) {
    normals.push(tmpnormals[i].x);
    normals.push(tmpnormals[i].y);
    normals.push(tmpnormals[i].z);
  }

  fireAttributes = generateElements(firePositions, fireTexPositions, fireIndices);  
  waterAttributes = generateElements(waterPositions, waterTexPositions, waterIndices);  

  attributes = new VertexAttributes();
  attributes.addAttribute('position', tri.positions.length/3, 3, tri.positions);
  attributes.addAttribute('normal', tri.positions.length/3, 3, normals);
  attributes.addIndices(tri.indices.flat());

  const vertexSource = `
  uniform mat4 clipFromEye;
  uniform mat4 eyeFromWorld;
  uniform mat4 worldFromModel;
  in vec3 position;
  in vec3 normal;
  out vec3 mixNormal;
  out vec3 mixPosition;

  void main() {
    gl_PointSize = 5.0;
    gl_Position = clipFromEye * eyeFromWorld * worldFromModel * vec4(position, 1.0);
    mixNormal = (eyeFromWorld  * vec4(normal, 0.0)).xyz;
    mixPosition = (eyeFromWorld  * vec4(position, 1.0)).xyz;
  }
  `;

  const fragmentSource = `
  uniform vec3 lightPosition;
  const vec3 albedo = vec3(0, 0, .5);
  in vec3 mixNormal;
  in vec3 mixPosition;
  out vec4 fragmentColor;

  void main() {
    vec3 lightDirection = normalize(lightPosition - mixPosition);
    vec3 normal = normalize(mixNormal);
    float litness = max(0.0, dot(normal, lightDirection));
    vec3 diffuse = albedo * litness;
    fragmentColor = vec4(diffuse, 1.0);
  }
  `;

  const eleVertexSource = `
  uniform mat4 clipFromEye;
  uniform mat4 eyeFromWorld;
  uniform mat4 worldFromModel;
  uniform vec3 worldUp;
  uniform float scale;
  uniform vec3 worldRight;
  in vec3 position;
  in vec3 normal;
  out vec3 mixNormal;
  in vec2 texPosition;
  out vec2 mixTexPosition;

  void main() {
    gl_PointSize = 3.0;
    vec2 factors = vec2(texPosition.x * 2.0 - 1.0, texPosition.y * 2.0);
    vec3 expandedPosition = position + factors.x * worldRight + factors.y * worldUp;
    gl_Position = clipFromEye * eyeFromWorld * worldFromModel * vec4(position + scale, 1.0);
    mixTexPosition = texPosition;
  }
  `;

  const eleFragmentSource = `
  uniform sampler2D sampTexture;
  in vec2 mixTexPosition;
  out vec4 fragmentColor;

  void main() {
    vec4 tex = texture(sampTexture, mixTexPosition);
    if (tex.a < 0.5) {
      discard;
    }
    else {
      fragmentColor = tex;
    }
  }
  `;

  shaderProgram = new ShaderProgram(vertexSource, fragmentSource);
  vao = new VertexArray(shaderProgram, attributes);

  fireShaderProgram = new ShaderProgram(eleVertexSource, eleFragmentSource);
  fireVao = new VertexArray(fireShaderProgram, fireAttributes);

  waterShaderProgram = new ShaderProgram(eleVertexSource, eleFragmentSource);
  waterVao = new VertexArray(waterShaderProgram, waterAttributes);

  window.addEventListener('resize', onResizeWindow);
  window.addEventListener('keydown', onKeyDown);

  canvas.addEventListener('pointerdown', event => {
    document.body.requestPointerLock();
  });

  window.addEventListener('pointermove', event => {
    if (document.pointerLockElement) {
      let rotationSpeed = 0.001;

      terrainCam.yaw(-event.movementX * rotationSpeed);
      terrainCam.pitch(-event.movementY * rotationSpeed);
      render();
    }
  });

  onResizeWindow();
  animateFrame();
}

window.addEventListener('load', initialize);

