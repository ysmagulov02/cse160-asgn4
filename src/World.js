// Yernar Smagulov
// ysmagulo@ucsc.edu

// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
    v_VertPos = u_ModelMatrix * a_Position;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform bool u_lightOn;

  uniform vec3 u_spotDirection; // Direction of the spotlight
  uniform float u_cutoff;       // Cosine of the cutoff angle


  void main() {

    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0); 

    } else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;

    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);

    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);

    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);

    } else {
      gl_FragColor = vec4(1.0, 0.2, 0.2, 1);
    }

    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);

    // Red/Green distance visualization
    // if (r<1.0) {
    //   gl_FragColor = vec4(1,0,0,1);
    // } else if (r<2.0) {
    //   gl_FragColor = vec4(0,1,0,1);
    // }

    // Light falloff visualization
    // gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);

    // N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);

    // Reflection 
    vec3 R = reflect(-L, N);

    // eye 
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    // Specular
    // float specular = pow(max(dot(E,R), 0.0), 10.0) * 0.65;

    // vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
    // vec3 ambient = vec3(gl_FragColor) * 0.3;
    // if (u_lightOn) {
    //   if (u_whichTexture == 0) {
    //     gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
    //   } else {
    //     gl_FragColor = vec4(diffuse+ambient, 1.0);
    //   }
    // }  

    // Spotlight (got help from Rohan Venkatapuram)
    if (u_lightOn) {
      vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
      vec3 ambient = vec3(gl_FragColor) * 0.3;
  
      vec3 R = reflect(-L, N);
      float specularStrength = pow(max(dot(E, R), 0.0), 10.0);
      vec3 specular = vec3(1.0, 1.0, 1.0) * specularStrength * 0.65;
  
      // Calculate spotlight effect
      vec3 spotDirection = normalize(u_spotDirection);
      float spotEffect = dot(-L, spotDirection);
      bool inSpotlight = spotEffect > u_cutoff;
  
      if (inSpotlight) {
          float intensity = pow(spotEffect, 20.0); 
          gl_FragColor = vec4((diffuse + ambient + specular) * (1.0 + intensity), 1.0);
      } else {
          gl_FragColor = vec4(diffuse + ambient + specular, 1.0);
      }
    }

  }`;

// Global variables 
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_NormalMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_whichTexture;
let u_Sampler1;
let u_lightPos;
let u_cameraPos;
let camera = new Camera();

function initTextures() {
  
  var image = new Image();
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }

  var image2 = new Image();
  if (!image2) {
    console.log('Failed to create the image2 object');
    return false;
  }

  // Register the event handler to be called on loading an image
  image.onload = function() { sendImageToTEXTURE0(image); }
  image2.onload = function() { sendImageToTEXTURE2(image2); }

  // Tell the browser to load on image
  image.src = 'sky.jpg';
  image2.src = 'grass1.jpg';

  // Add more texture loading
  return true;
}

function sendImageToTEXTURE0(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler0
  gl.uniform1i(u_Sampler0, 0);
  
  console.log('finished loading texture 0');
}

function sendImageToTEXTURE2(image) {
  var texture2 = gl.createTexture();
  if (!texture2) {
    console.log('Failed to create the texture object 2');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE2);
  
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture2);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 1 to the sampler 1
  gl.uniform1i(u_Sampler1, 2);
  
  console.log('finished loading texture 2');
}



function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}


function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of a_Normal
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_lightPos
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  // Get the storage location of u_cameraPos
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_NormalMatrix
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
    return;
  }

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }

  // Get the storage location of u_lightOn
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get u_lightOn');
    return;
  }


  // Set the initial value for this matrix to identity 
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}


function setSpotlight() {
  const spotDirection = [0, 0, -1];
  const cutoffAngle = Math.cos(Math.PI / 4); // 45 degrees

  gl.uniform3fv(gl.getUniformLocation(gl.program, "u_spotDirection"), spotDirection);
  gl.uniform1f(gl.getUniformLocation(gl.program, "u_cutoff"), cutoffAngle);
}


// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 10;
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_yellowAnimation = false;
let g_magentaAnimation = false;

// Globals related to the bird
let g_headAngle = 0;
let g_scapularAngle = 0;
let g_wingAngle = 0;
let g_headAnimation = false;
let g_scapularAnimation = false;
let g_wingAnimation = false;

// Globals related to normal and light
let g_normalOn = false;
let g_lightPos = [0,1,-2];
var g_lightOn = true;

// Globals related to the camera 
let g_cameraX = 0;
let g_cameraY = 0;
let g_cameraZ = 0;

// Globals for mouse control
let isDragging = false;
let mouseLastX = 0;
let mouseLastY = 0;
let g_yAngle = 0; // Global angle for Y-axis rotation
let g_xAngle = 0; // Global angle for X-axis rotation

// Model rotation angles
let g_modelYAngle = 0; // Global angle for Y-axis rotation of the model
let g_modelXAngle = 0; // Global angle for X-axis rotation of the model

function handleMouseDown(event) {
  // Start dragging
  isDragging = true;
  mouseLastX = event.clientX;
  mouseLastY = event.clientY;
}

function handleMouseUp(event) {
  // Stop dragging
  isDragging = false;
}

function handleMouseMove(event) {
  if (isDragging) {
    var deltaX = event.clientX - mouseLastX;
    var deltaY = event.clientY - mouseLastY;
    g_modelYAngle = (g_modelYAngle + deltaX) % 360;
    g_modelXAngle = (g_modelXAngle + deltaY) % 360;
    renderAllShapes();
  }
  mouseLastX = event.clientX;
  mouseLastY = event.clientY;
}

function addMouseControl() {
  canvas.onmousedown = handleMouseDown;
  canvas.onmouseup = handleMouseUp;
  canvas.onmouseout = handleMouseUp; // Handle the mouse going out of the viewport
  canvas.onmousemove = handleMouseMove;
}


// optimizing the performance
function initBuffers() {
  // Interleaved vertex and UV coordinates for each face of the cube
  const verticesAndUVs = [
      // Front face
      0,0,0, 0,0,  1,1,0, 1,1,  1,0,0, 1,0,
      0,0,0, 0,0,  0,1,0, 0,1,  1,1,0, 1,1,
      // Back face
      1,0,1, 1,0,  1,1,1, 1,1,  0,1,1, 0,1,
      1,0,1, 1,0,  0,1,1, 0,1,  0,0,1, 0,0,
      // Right side
      1,0,0, 1,0,  1,1,0, 1,1,  1,1,1, 0,1,
      1,0,0, 1,0,  1,1,1, 0,1,  1,0,1, 0,0,
      // Left side
      0,0,1, 1,0,  0,1,1, 1,1,  0,1,0, 0,1,
      0,0,1, 1,0,  0,1,0, 0,1,  0,0,0, 0,0,
      // Bottom
      1,0,0, 1,0,  1,0,1, 1,1,  0,0,1, 0,1,
      1,0,0, 1,0,  0,0,1, 0,1,  0,0,0, 0,0,
      // Top
      0,1,0, 1,0,  0,1,1, 1,1,  1,1,1, 0,1,
      0,1,0, 1,0,  1,1,1, 0,1,  1,1,0, 0,0,
  ];

  // Create a buffer object
  const vertexUVBuffer = gl.createBuffer();
  if (!vertexUVBuffer) {
      console.error('Failed to create the buffer object');
      return null;
  }

  // Bind the buffer object to target and write data into it
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexUVBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesAndUVs), gl.STATIC_DRAW);

  return vertexUVBuffer;
}


// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {

  // Button Events 
  // document.getElementById('animationYellowOffButton').onclick = function() {g_yellowAnimation = false;};
  // document.getElementById('animationYellowOnButton').onclick = function() {g_yellowAnimation = true;};

  // document.getElementById('animationMagentaOffButton').onclick = function() {g_magentaAnimation = false;};
  // document.getElementById('animationMagentaOnButton').onclick = function() {g_magentaAnimation = true;};


  // // Slider Events
  // document.getElementById('yellowSlide').addEventListener('mousemove', function() {g_yellowAngle = this.value; renderAllShapes(); });
  // document.getElementById('magentaSlide').addEventListener('mousemove', function() {g_magentaAngle = this.value; renderAllShapes(); });

  // Button Events 
  document.getElementById('normalOn').onclick = function() {g_normalOn = true;};
  document.getElementById('normalOff').onclick = function() {g_normalOn = false;};

  document.getElementById('lightOn').onclick = function() {g_lightOn = true;};
  document.getElementById('lightOff').onclick = function() {g_lightOn = false;};

  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) { g_lightPos[0] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) { g_lightPos[1] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) { g_lightPos[2] = this.value/100; renderAllShapes();}});

  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  document.getElementById('animationHeadOffButton').onclick = function() {g_headAnimation = false;};
  document.getElementById('animationHeadOnButton').onclick = function() {g_headAnimation = true;};

  document.getElementById('animationScapularOffButton').onclick = function() {g_scapularAnimation = false;};
  document.getElementById('animationScapularOnButton').onclick = function() {g_scapularAnimation = true;};

  document.getElementById('animationWingsOffButton').onclick = function() {g_wingAnimation = false;};
  document.getElementById('animationWingsOnButton').onclick = function() {g_wingAnimation = true;};

  // Slider Events
  document.getElementById('headSlide').addEventListener('mousemove', function() {g_headAngle = this.value; renderAllShapes(); });
  document.getElementById('ScapularSlide').addEventListener('mousemove', function() {g_scapularAngle = this.value; renderAllShapes(); });
  document.getElementById('WingsSlide').addEventListener('mousemove', function() {g_wingAngle = this.value; renderAllShapes(); });
  

  // Camera Angle Slider Events
	document.getElementById("x_angle").addEventListener('mousemove', function() {g_cameraX = this.value; console.log(this.value); renderAllShapes();});
	document.getElementById("y_angle").addEventListener('mousemove', function() {g_cameraY = this.value; console.log(this.value); renderAllShapes();});
	document.getElementById("z_angle").addEventListener('mousemove', function() {g_cameraZ = this.value; console.log(this.value); renderAllShapes();});
}


function main() {

  // get the canvas and gl context
  setupWebGL();
  
  // compile the shader programs, attach the javascript variables to the GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  document.onkeydown = keydown;

  initTextures();

  addMouseControl(); // Activate mouse controls

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);
  // renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

// Called by browser repatedly whenever its time
function tick() {
  // Save the current time
  g_seconds = performance.now()/1000.0-g_startTime;

  // Update Animation Angles
  updateAnimationAngles();
  
  // Draw everything
  renderAllShapes();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

// function updateAnimationAngles() {
//   if (g_yellowAnimation) {
//     g_yellowAngle = (45*Math.sin(g_seconds));
//   }
//   if (g_magentaAnimation) {
//     g_magentaAngle = (45*Math.sin(3*g_seconds));
//   }


//   g_lightPos[0] = 2.3 * Math.cos(g_seconds);
// }

function updateAnimationAngles() {
  if (g_headAnimation) {
    g_headAngle = 20 * Math.sin(2 * g_seconds) + 20;
  }
  if (g_scapularAnimation) {
    g_scapularAngle = 30 * Math.sin(2 * g_seconds);
  }
  if (g_wingAnimation) {
		g_wingAngle = 90 * Math.sin(8*g_seconds);
  }
  g_lightPos[0] = 2.3 * Math.cos(g_seconds);
}


function keydown(ev) {
  if (ev.keyCode == 87) { // W
    camera.forward(); 
    // console.log(camera.eye);
  }
  if (ev.keyCode == 83) { // S
    camera.back();
  }
  if (ev.keyCode == 68) { // D
    camera.right();
  }
  if (ev.keyCode == 65) { // A
    camera.left();
  }
  if (ev.keyCode == 81) { // Q
    camera.panLeft();
  }
  if (ev.keyCode == 69) { // E
    camera.panRight();
  }

  renderAllShapes();
}

// function that handles drawing the bird
function createTwiterBird() {

  // body 
  var body = new Cube();
  body.color = [0.114, 0.631, 0.949, 1.0]; // A vibrant blue
  body.textureNum = -2;
  if (g_normalOn) body.textureNum = -3;
  body.matrix.translate(-0.25, -0.25, 0); 
  body.matrix.rotate(0, 1, 0, 0); 
  var bodyMatrix = new Matrix4(body.matrix); 
  body.matrix.scale(0.5, 0.2, 0.2); 
  body.normalMatrix.setInverseOf(body.matrix).transpose();
  body.render();
  
  // head
  var head = new Cube();
  head.color = body.color = [0.114, 0.631, 0.949, 1.0]; // A vibrant blue
  head.textureNum = -2;
  if (g_normalOn) head.textureNum = -3;
  head.matrix = new Matrix4(bodyMatrix);
  head.matrix.translate(-0.15, 0, 0.025);
  head.matrix.rotate(g_headAngle, 0, 0, 1);
  var headMatrix = new Matrix4(head.matrix);
  head.matrix.scale(0.2, 0.275, 0.15);
  head.normalMatrix.setInverseOf(head.matrix).transpose();
  head.render();

  // left eye
  var left_eye = new Cube();
  left_eye.color = [0.0, 0.0, 0.0, 1.0]; // Black
  left_eye.textureNum = -2;
  if (g_normalOn) left_eye.textureNum = -3;
  left_eye.matrix = new Matrix4(headMatrix);
  left_eye.matrix.translate(0.03, 0.115, -0.01); 
  left_eye.matrix.scale(0.09, 0.09, 0.01);
  left_eye.normalMatrix.setInverseOf(left_eye.matrix).transpose();
  left_eye.render();
  
  // left pupil
  var left_eye_pupil = new Cube();
  left_eye_pupil.color = [1.0, 1.0, 1.0, 1.0]; // White
  left_eye_pupil.textureNum = -2;
  if (g_normalOn) left_eye_pupil.textureNum = -3;
  left_eye_pupil.matrix = new Matrix4(headMatrix);
  left_eye_pupil.matrix.translate(0.03, 0.115, -0.02); 
  left_eye_pupil.matrix.scale(0.04, 0.04, 0.01);
  left_eye_pupil.normalMatrix.setInverseOf(left_eye_pupil.matrix).transpose();
  left_eye_pupil.render();

  // right eye
  var right_eye = new Cube();
  right_eye.color = [0.0, 0.0, 0.0, 1.0]; // Black
  right_eye.textureNum = -2;
  if (g_normalOn) right_eye.textureNum = -3;
  right_eye.matrix = new Matrix4(headMatrix);
  right_eye.matrix.translate(0.03, 0.115, 0.15); 
  right_eye.matrix.scale(0.09, 0.09, 0.01); 
  right_eye.normalMatrix.setInverseOf(right_eye.matrix).transpose();
  right_eye.render();
  
  // right pupil
  var right_eye_pupil = new Cube();
  right_eye_pupil.color = [1.0, 1.0, 1.0, 1.0]; // White
  right_eye_pupil.textureNum = -2;
  if (g_normalOn) right_eye_pupil.textureNum = -3;
  right_eye_pupil.matrix = new Matrix4(headMatrix);
  right_eye_pupil.matrix.translate(0.03, 0.115, 0.16); 
  right_eye_pupil.matrix.scale(0.04, 0.04, 0.01); 
  right_eye_pupil.normalMatrix.setInverseOf(right_eye_pupil.matrix).transpose();
  right_eye_pupil.render();
  
  // nose
  var nose = new Cube();
  nose.color = [0.804, 0.522, 0.247, 1.0]; // Light Brown
  nose.textureNum = -2;
  if (g_normalOn) nose.textureNum = -3;
  nose.matrix = new Matrix4(headMatrix);
  nose.matrix.translate(-0.03, 0.0375, 0); 
  nose.matrix.scale(0.03, 0.125, 0.15); 
  nose.matrix.translate(-2.83, 0.8, 0);
  nose.matrix.scale(3.83, -0.64, 1.0); 
  nose.normalMatrix.setInverseOf(nose.matrix).transpose();
  nose.render();

  // tail
  var tail = new Cube();
  tail.color = [0.678, 0.847, 0.902, 1.0]; // Light Blue
  tail.textureNum = -2;
  if (g_normalOn) tail.textureNum = -3;
  tail.matrix = new Matrix4(bodyMatrix);
  tail.matrix.translate(0.45, 0.05, 0.05);
  tail.matrix.rotate(0, 1, 0, 0);
  tail.matrix.scale(0.15, 0.1, 0.1);
  tail.normalMatrix.setInverseOf(tail.matrix).transpose();
  tail.render();

  // left scapular
  var left_scapular = new Cube();
  left_scapular.color = [0.091, 0.505, 0.759, 1.0]; // Darker vibrant blue
  left_scapular.textureNum = -2;
  if (g_normalOn) left_scapular.textureNum = -3;
  left_scapular.matrix = new Matrix4(bodyMatrix);
  left_scapular.matrix.translate(0.2, 0.08, -0.09); 
  left_scapular.matrix.rotate(g_scapularAngle, 0, 0, 1);
  left_scapular.matrix.translate(-0.05, 0, 0); 
  var frontLeftLegCoordMatrix = new Matrix4(left_scapular.matrix);
  left_scapular.matrix.scale(0.255, 0.06, 0.1); 
  left_scapular.normalMatrix.setInverseOf(left_scapular.matrix).transpose();
  left_scapular.render();

  // left wing
  var left_wing = new Cube();
  left_wing.color = [0.678, 0.847, 0.902, 1.0]; // Light Blue
  left_wing.textureNum = -2;
  if (g_normalOn) left_wing.textureNum = -3;
  left_wing.matrix = new Matrix4(frontLeftLegCoordMatrix);
  left_wing.matrix.translate(0, 0.045, -0.002);
  left_wing.matrix.rotate(180 - g_wingAngle, 1, 0, 0);
  left_wing.matrix.translate(-0.0375, 0, 0); 
  left_wing.matrix.scale(0.4, 0.03, 0.2); 
  left_wing.normalMatrix.setInverseOf(left_wing.matrix).transpose();
  left_wing.render();

  // right scapular
	var right_scapular = new Cube();
  right_scapular.color = [0.091, 0.505, 0.759, 1.0]; // Darker vibrant blue
  right_scapular.textureNum = -2;
  if (g_normalOn) right_scapular.textureNum = -3;
  right_scapular.matrix = new Matrix4(bodyMatrix);
  right_scapular.matrix.translate(0.2, 0.08, 0.2);
  right_scapular.matrix.rotate(g_scapularAngle, 0, 0, 1);
  right_scapular.matrix.translate(-0.05, 0, 0); 
  var frontRightLegCoordMatrix = new Matrix4(right_scapular.matrix);
  right_scapular.matrix.scale(0.255, 0.06, 0.1); 
  right_scapular.normalMatrix.setInverseOf(right_scapular.matrix).transpose();
  right_scapular.render();
	
  // right wing
  var right_wing = new Cube();
  right_wing.color = [0.678, 0.847, 0.902, 1.0]; // Light Blue
  right_wing.textureNum = -2;
  if (g_normalOn) right_wing.textureNum = -3;
  right_wing.matrix = new Matrix4(frontRightLegCoordMatrix);
  right_wing.matrix.translate(0.05, 0.015, 0.1); // modify z here to make it further away from body
  right_wing.matrix.rotate(g_wingAngle, 1, 0, 0);
  right_wing.matrix.translate(-0.0875, 0, 0); 
  right_wing.matrix.scale(0.4, 0.03, 0.2); 
  right_wing.normalMatrix.setInverseOf(right_wing.matrix).transpose();
  right_wing.render();

  // rice hat out of a pyramid
  var hat = new Pyramid();
  hat.color = [0.85, 0.75, 0.60, 1.0]; // Straw color
  hat.textureNum = -2;
  if (g_normalOn) hat.textureNum = -3;
  hat.matrix = new Matrix4(headMatrix);
  hat.matrix.translate(0.025, 0.27 , -0.008);
  hat.matrix.scale(0.2/1.4, 0.025/1.4, 0.225/1.4);
  // hat.normalMatrix.setInverseOf(hat.matrix).transpose();
  hat.render();
  
}


// var g_eye = [0, 0, 3];
// var g_at = [0, 0, -100];
// var g_up = [0, 1, 0];
// var g_camera = new Camera();

// var g_map = [
// [1, 1, 1, 1, 1, 1, 1, 1],
// [1, 0, 0, 0, 0, 0, 0, 1],
// [1, 0, 0, 0, 0, 0, 0, 1],
// [1, 0, 0, 1, 1, 0, 0, 1],
// [1, 0, 0, 0, 0, 0, 0, 1],
// [1, 0, 0, 0, 0, 0, 0, 1],
// [1, 0, 0, 0, 1, 0, 0, 1],
// [1, 0, 0, 0, 0, 0, 0, 1],
// ];

// function drawMap() {
//   for (i=0; i<2; i++) {
//     for (x=0; x<32; x++) {
//       for (y=0; y<32; y++) {
//         var body = new Cube();
//         body.color = [0.8, 1.0, 1.0, 1.0];
//         body.matrix.translate(0, -0.75, 0);
//         body.matrix.scale(0.4, 0.4, 0.4);
//         body.matrix.translate(x-16, 0, y-16);
//         body.renderfast();
//       }
//     }
//   }
// }

function drawMap(){
  for(let x = 0; x < 32; x++){
    for(let y = 0; y < 32; y++){
      if (x == 0 || x == 31 || y == 0 || y == 31) {
        let wall = new Cube();
        if ((x + y) % 8 < 4) {
          wall.color = [0.75, 0.75, 0.75, 1.0]; // Light gray
        } else {
          wall.color = [0.25, 0.25, 0.25, 1.0]; // Dark gray
        }
        wall.textureNum = -2;
        wall.matrix.scale(0.25, 2, 0.25); // Scale to make walls 3 blocks high
        wall.matrix.translate(x - 16, -0.375, y - 16); // Adjust translation for height
        wall.renderFaster();
      }
    }
  }
}



// Draw every shape that is supposed to be on the canvas
function renderAllShapes() {
  // Check the time at the start of this function 
  var startTime = performance.now();

  // Pass the projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(camera.fov, 1*canvas.width/canvas.height, 0.1, 1000);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Pass the view matrix
  var viewMat = new Matrix4();
  viewMat.setLookAt(
    camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2], 
    camera.at.elements[0], camera.at.elements[1], camera.at.elements[2], 
    camera.up.elements[0], camera.up.elements[1], camera.up.elements[2]
  );

  // viewMat.setLookAt(
  //   camera.eye.x, camera.eye.y, camera.eye.z, 
  //   camera.at.x, camera.at.y, camera.at.z, 
  //   camera.up.x, camera.up.y, camera.up.z
  // ); // (eye, at, up)
  
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Model rotation matrix
  var modelRotateMatrix = new Matrix4().rotate(g_modelXAngle, 1, 0, 0); // Rotate model around x-axis
  modelRotateMatrix.rotate(g_modelYAngle, 0, 1, 0); // Rotate model around y-axis

  // Camera rotation matrix
  var cameraRotateMatrix = new Matrix4().rotate(g_cameraX, 1, 0, 0); // Rotate camera around x-axis
  cameraRotateMatrix.rotate(g_cameraY, 0, 1, 0); // Rotate camera around y-axis
  cameraRotateMatrix.rotate(g_cameraZ, 0, 0, 1); // Rotate camera around z-axis

  // Combine the rotations
  var globalRotateMatrix = cameraRotateMatrix.multiply(modelRotateMatrix);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotateMatrix.elements);

  // Draw the map
  // drawMap();

  // Pass the light position to GLSL
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

  // Pass the camera position to GLSL
  gl.uniform3f(u_cameraPos, camera.eye.x, camera.eye.y, camera.eye.z);

  // Pass the light status
  gl.uniform1i(u_lightOn, g_lightOn);

  // spotlight
  setSpotlight();

  
  // draw the light
  var light = new Cube();
  light.color = [2,2,0,1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-0.1, -0.1, -0.1);
  light.matrix.translate(-0.5, -0.5, -0.5);
  light.render();

  // draw sphere
  var sp = new Sphere();
  // sp.textureNum = 0;
  if (g_normalOn) sp.textureNum = -3;
  // sp.matrix.scale(0.5, 0.5, 0.5);
  sp.matrix.translate(-2, 0.5, -0.5);
  sp.render();

  // grass
  var grass = new Cube();
  grass.color = [0.15, 0.85, 0.35, 1];
  grass.textureNum = 1;
  grass.matrix.translate(0, -0.85, 0.0);
  grass.matrix.scale(10, 0.1, 10);
  grass.matrix.translate(-0.5, 0, -0.5);
  grass.render();

  // sky
  var sky = new Cube();
  sky.color = [.6, .9, .95, 1];
  // sky.color = [0.8, 0.8, 0.8, 1.0];
  if (g_normalOn) sky.textureNum = -3;
  sky.matrix.scale(-15, -15, -15);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  // Draw the body cube
  // var body = new Cube();
  // body.color = [1.0, 0.5, 0.5, 1.0];
  // if (g_normalOn) body.textureNum = -3;
  // body.matrix.translate(-0.25, -0.75, 0.0);
  // body.matrix.rotate(-5, 1, 0, 0);
  // body.matrix.scale(0.5, 0.3, 0.5);
  // body.normalMatrix.setInverseOf(body.matrix).transpose();
  // body.render();

  // Yellow box
  // var yellow = new Cube();
  // yellow.color = [1, 1, 0, 1];
  // if (g_normalOn) yellow.textureNum = -3;
  // yellow.matrix.setTranslate(0, -0.5, 0.0);
  // yellow.matrix.rotate(-5, 1, 0, 0);
  // yellow.matrix.rotate(-g_yellowAngle, 0, 0, 1);
  // var yellowCoordinatesMat = new Matrix4(yellow.matrix);
  // yellow.matrix.scale(0.25, 0.7, 0.5);
  // yellow.matrix.translate(-0.5, 0, 0);
  // yellow.normalMatrix.setInverseOf(yellow.matrix).transpose();
  // yellow.render();

  // Magenta box 
  // var magenta = new Cube();
  // magenta.color = [1, 0, 1, 1];
  // if (g_normalOn) magenta.textureNum = -3;
  // magenta.matrix = yellowCoordinatesMat;
  // magenta.matrix.translate(0, 0.65, 0);
  // magenta.matrix.rotate(g_magentaAngle, 0, 0, 1);
  // magenta.matrix.scale(0.3, 0.3, 0.3);
  // magenta.matrix.translate(-0.5, 0, -0.001);
  // magenta.render();

  createTwiterBird();

  // Check the time at the end of the function, and show on the web page
  var endTime = performance.now();
  var renderTime = endTime - startTime;
  var fps = 1000 / renderTime; // Calculate frames per second

  sendTextToHTML(`Render Time: ${renderTime.toFixed(2)} ms, FPS: ${fps.toFixed(1)}`, "performanceIndicator");

}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}


