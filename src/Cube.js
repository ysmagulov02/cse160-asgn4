class Cube {
    // Constructor
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -2;
    }

    // Render this shape
    // render() {
    //     // var xy = this.position;
    //     var rgba = this.color;
    //     // var size = this.size;

    //     // Pass the texture number
    //     gl.uniform1i(u_whichTexture, this.textureNum);
        
    //     // Pass the color of a point to u_FragColor variable
    //     gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    //     // Pass the matrix to u_ModelMatrix attribute
    //     gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
    //     // Front of the cube
    //     drawTriangle3DUV([0,0,0,  1,1,0,  1,0,0], [0,0, 1,1, 1,0]);
    //     drawTriangle3DUV([0,0,0,  0,1,0,  1,1,0], [0,0, 0,1, 1,1]);

    //     gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);

    //     // drawTriangle3D([0, 0, 0,  1, 1, 0,  1, 0, 0]);
    //     // drawTriangle3D([0, 0, 0,  0, 1, 0,  1, 1, 0]);

    //     // Top of the cube
    //     drawTriangle3DUV([0,1,0,  0,1,1,  1,1,1], [0,0, 0,1, 1,0]);
    //     drawTriangle3DUV([0,1,0,  1,1,1,  1,1,0], [0,0, 1,1, 1,0]);

    //     gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);


    //     // drawTriangle3D([0, 1, 0,  0, 1, 1,  1, 1, 1]);
    //     // drawTriangle3D([0, 1, 0,  1, 1, 1,  1, 1, 0]);

    //     // Right of the cube
    //     drawTriangle3D([1, 1, 0,  1, 1, 1,  1, 0, 1]);
    //     drawTriangle3D([1, 1, 0,  1, 0, 1,  1, 0, 0]);

    //     // Left of the cube
    //     drawTriangle3D([0, 1, 0,  0, 0, 1,  0, 1, 1]);
    //     drawTriangle3D([0, 1, 0,  0, 0, 0,  0, 0, 1]);

    //     // Bottom of the cube
    //     drawTriangle3D([0, 0, 0,  1, 0, 1,  1, 0, 0]);
    //     drawTriangle3D([0, 0, 0,  0, 0, 1,  1, 0, 1]);

    //     // Back of the cube
    //     drawTriangle3D([0, 0, 1,  1, 0, 1,  1, 1, 1]);
    //     drawTriangle3D([0, 0, 1,  1, 1, 1,  0, 1, 1]);
    // }

    
    // render 
    render() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;

        // Set the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);
  
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  
        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Pass the matrix to u_NormalMatrix attribute
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);
  
        // Front of the Cube
        drawTriangle3DUVNormal([0,0,0, 1,1,0, 1,0,0],[0,0, 1,1, 1,0], [0,0,-1, 0,0,-1, 0,0,-1]);
        drawTriangle3DUVNormal([0,0,0, 0,1,0, 1,1,0],[0,0, 0,1, 1,1], [0,0,-1, 0,0,-1, 0,0,-1]);

        // Back of the Cube
        drawTriangle3DUVNormal([1,0,1, 0,0,1, 0,1,1],[0,0, 1,0, 1,1], [0,0,1, 0,0,1, 0,0,1]);
        drawTriangle3DUVNormal([1,0,1, 1,1,1, 0,1,1],[0,1, 0,1, 1,1], [0,0,1, 0,0,1, 0,0,1]);
  
        // Right side of the Cube
        drawTriangle3DUVNormal([1,0,0, 1,1,0, 1,1,1],[0,0, 0,1, 1,1], [1,0,0, 1,0,0, 1,0,0]);
        drawTriangle3DUVNormal([1,0,0, 1,0,1, 1,1,1],[0,0, 1,0, 1,1], [1,0,0, 1,0,0, 1,0,0]);
  
        // Left side of the Cube
        drawTriangle3DUVNormal([0,0,0, 0,0,1, 0,1,1],[1,0, 0,0, 0,1], [-1,0,0, -1,0,0, -1,0,0]);
        drawTriangle3DUVNormal([0,0,0, 0,1,0, 0,1,1],[1,0, 1,1, 0,1], [-1,0,0, -1,0,0, -1,0,0]);
  
        // Bottom of the Cube
        drawTriangle3DUVNormal([0,0,0, 1,0,1, 1,0,0],[0,1, 1,0, 1,1], [0,-1,0, 0,-1,0, 0,-1,0]);
        drawTriangle3DUVNormal([0,0,0, 0,0,1, 1,0,1],[0,1, 0,0, 1,0], [0,-1,0, 0,-1,0, 0,-1,0]);

        // Top of the Cube
        drawTriangle3DUVNormal([1,1,0, 1,1,1, 0,1,0],[1,0, 1,1, 0,0], [0,1,0, 0,1,0, 0,1,0]);
        drawTriangle3DUVNormal([0,1,1, 1,1,1, 0,1,0],[0,1, 1,1, 0,0], [0,1,0, 0,1,0, 0,1,0]);
  
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    }

    // render() {
    //     // var xy = this.position;
    //     var rgba = this.color;
    //     // var size = this.size;

    //     // Set the texture number
    //     gl.uniform1i(u_whichTexture, this.textureNum);

    //     // Pass the color of a point to u_FragColor variable
    //     gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    //     // Pass the matrix to u_ModelMatrix attribute
    //     gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    //     // Create a buffer for the vertex coordinates
    //     var vertBuff = gl.createBuffer();
    //     if (!vertBuff) {
    //         console.error('Failed to create the buffer object');
    //         return false;
    //     }

    //     // Bind the buffer to the ARRAY_BUFFER target
    //     gl.bindBuffer(gl.ARRAY_BUFFER, vertBuff);

    //     // Front of the cube
    //     drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0], vertBuff);
    //     drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1], vertBuff);

    //     // Back of the cube
    //     drawTriangle3DUV([1,0,1, 1,1,1, 0,1,1], [1,0, 1,1, 0,1], vertBuff);
    //     drawTriangle3DUV([1,0,1, 0,1,1, 0,0,1], [1,0, 0,1, 0,0], vertBuff);

    //     // Right side of the cube
    //     drawTriangle3DUV([1,0,0, 1,1,0, 1,1,1], [1,0, 1,1, 0,1], vertBuff);
    //     drawTriangle3DUV([1,0,0, 1,1,1, 1,0,1], [1,0, 0,1, 0,0], vertBuff);

    //     // Left side of the cube
    //     drawTriangle3DUV([0,0,1, 0,1,1, 0,1,0], [1,0, 1,1, 0,1], vertBuff);
    //     drawTriangle3DUV([0,0,1, 0,1,0, 0,0,0], [1,0, 0,1, 0,0], vertBuff);

    //     // Bottom of the cube
    //     drawTriangle3DUV([1,0,0, 1,0,1, 0,0,1], [1,0, 1,1, 0,1], vertBuff);
    //     drawTriangle3DUV([1,0,0, 0,0,1, 0,0,0], [1,0, 0,1, 0,0], vertBuff);

    //     // Top of the cube
    //     drawTriangle3DUV([0,1,0, 0,1,1, 1,1,1], [1,0, 1,1, 0,1], vertBuff);
    //     drawTriangle3DUV([0,1,0, 1,1,1, 1,1,0], [1,0, 0,1, 0,0], vertBuff);
    // }

    renderfast() {
        var rgba = this.color;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var allverts = [];

        // Front of the cube
        allverts = allverts.concat( [0,0,0, 1,1,0, 1,0,0]);
        allverts = allverts.concat( [0,0,0, 0,1,0, 1,1,0]);

        // Top of the cube
        allverts = allverts.concat( [0,1,0, 0,1,1, 1,1,1]);
        allverts = allverts.concat( [0,1,0, 1,1,1, 1,1,0]);

        // Right of the cube
        allverts = allverts.concat( [1,1,0, 1,1,1, 1,0,0]);
        allverts = allverts.concat( [1,0,0, 1,1,1, 1,0,1]);

        // Left of the cube
        allverts = allverts.concat( [0,1,0, 0,1,1, 0,0,0]);
        allverts = allverts.concat( [0,0,0, 0,1,1, 0,0,1]);

        // Bottom of the cube
        allverts = allverts.concat( [0,0,0, 0,0,1, 1,0,1]);
        allverts = allverts.concat( [0,0,0, 1,0,1, 1,0,0]);

        // Back of the cube
        allverts = allverts.concat( [0,0,1, 1,1,1, 1,0,1]);
        allverts = allverts.concat( [0,0,1, 0,1,1, 1,1,1]);

        drawTriangle3D(allverts);
    }

    renderFaster() {
        const buffer = initBuffers(); // Initialize once and store it if not changing
    
        // Set WebGL state
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
        // Bind the buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    
        // Set the attributes for position and UV coordinates
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
    
        // Enable the vertex attributes
        gl.enableVertexAttribArray(a_Position);
        gl.enableVertexAttribArray(a_UV);
    
        // Draw the cube
        gl.drawArrays(gl.TRIANGLES, 0, 36); // 6 faces * 2 triangles per face * 3 vertices per triangle
    }
    

}
