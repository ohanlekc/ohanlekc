import {Vector4} from "./vector.js";
import {Vector3} from "./vector.js";

export class Matrix4 {

    constructor() {
        this.mem = new Float32Array(16);  // [0, 4, 8,  12,
        for (let i; i <16; i++) {
            this.mem[i] = 0;
        }                                //  1, 5, 9,  13,
                                         //  2, 6, 10, 14,
                                         //  3, 7, 11, 15,]
    }

    get(row, column) {
        return this.mem[(column * 4) + row];
    }
    
    set(row, column, value) {
        this.mem[(column * 4) + row] = value;
    }

    toBuffer() {
        return this.mem;
    }

    static identity() {
        var iden = new Matrix4();
        iden.mem[0] = 1;
        iden.mem[1] = 0;
        iden.mem[2] = 0;
        iden.mem[3] = 0;

        iden.mem[4] = 0;
        iden.mem[5] = 1;
        iden.mem[6] = 0;
        iden.mem[7] = 0;

        iden.mem[8]  = 0;
        iden.mem[9]  = 0;
        iden.mem[10] = 1;
        iden.mem[11] = 0;

        iden.mem[12] = 0;
        iden.mem[13] = 0;
        iden.mem[14] = 0;
        iden.mem[15] = 1;
        return iden;
    }

    static scale(x, y, z) {
        var scaledMat = new Matrix4();
        //scaledMat = 
        // Set up array with x, y, and z factors
        // in their appropriate rows
        scaledMat.set(0, 0, x);
        scaledMat.set(1, 1, y);
        scaledMat.set(2, 2, z);
        scaledMat.set(3, 3, 1);
        return scaledMat;
    }

    static translate(x_offset, y_offset, z_offset) {
        let trans;
        trans = new Matrix4();
        trans.set(0, 3, x_offset);
        trans.set(1, 3, y_offset);
        trans.set(2, 3, z_offset);
        trans.set(0, 0, 1);
        trans.set(1, 1, 1);
        trans.set(2, 2, 1);
        trans.set(3, 3, 1);
        return trans;
    }

    static rotateX(degrees) {
        var rotX = new Matrix4();
        //rotX.identity();
        rotX.set( 0, 0, 1);
        rotX.set( 1, 1, Math.cos(degrees*Math.PI/180));
        rotX.set( 1, 2, -Math.sin(degrees*Math.PI/180));
        rotX.set( 2, 1, Math.sin(degrees*Math.PI/180));
        rotX.set( 2, 2, Math.cos(degrees*Math.PI/180));
        rotX.set( 3, 3, 1);
        
        return rotX;
    }
    
    static rotateY(degrees) {
        let rY = new Matrix4();
        //.identity();
        rY.set(0, 0, Math.cos(degrees*Math.PI/180));
        rY.set(2, 0, Math.sin(degrees*Math.PI/180));
        rY.set(0, 2, -Math.sin(degrees*Math.PI/180));
        rY.set(2, 2, Math.cos(degrees*Math.PI/180));
        rY.set(1, 1, 1);
        rY.set(3, 3, 1);
        return rY;
    }

    static rotateZ(degrees) {
        let rotZ = new Matrix4();
        //rotZ.identity();
        let radians = degrees * Math.PI / 180;
        rotZ.set(0, 0, Math.cos(radians));
        rotZ.set(0, 1, -Math.sin(radians));
        rotZ.set(1, 0, Math.sin(radians));
        rotZ.set(1, 1, Math.cos(radians));
        rotZ.set(2, 2, 1);
        rotZ.set(3, 3, 1);
        return rotZ;
    }

    static fovPerspective(vDegrees, aspRatio, near, far) {
        let top = Math.tan(vDegrees/2) * near;
        let right = aspRatio * top;
        let fov = new Matrix4();
        fov.set(0, 0, near/right);
        fov.set(1,1, near / top);
        fov.set(2, 2, (near + far) / (near - far));
        fov.set(2, 3, (2*near*far) / (near - far));
        fov.set(3, 2, -1);
        return fov;
    }

    static ortho(left, right, bottom, top, near, far) {
        let orth = new Matrix4();
        orth.set(0, 0, 2 / (right - left));
        orth.set(1, 1, 2 / (top - bottom));
        orth.set(2, 2, 2 / (near - far));
        orth.set(0, 3, -(right + left) / (right - left));
        orth.set(1, 3, -(top + bottom) / (top - bottom));
        orth.set(2, 3, (near + far) / (near - far));
        orth.set(3, 3, 1);
        return orth;
    }

    multiplyVector(vec4) {
        var val1 = vec4.x * this.get(0,0) + vec4.y * this.get(0,1) + vec4.z * this.get(0,2) + vec4.w * this.get(0,3);
        var val2 = vec4.x * this.get(1,0) + vec4.y * this.get(1,1) + vec4.z * this.get(1,2) + vec4.w * this.get(1,3);
        var val3 = vec4.x * this.get(2,0) + vec4.y * this.get(2,1) + vec4.z * this.get(2,2) + vec4.w * this.get(2,3);
        var val4 = vec4.x * this.get(3,0) + vec4.y * this.get(3,1) + vec4.z * this.get(3,2) + vec4.w * this.get(3,3);
        
        //var iden = new Vector4();
        return new Vector4(val1,val2,val3,val4);

    }



    multiplyMatrix(mat4) {
        var multMat = new Matrix4();
        var val1 = this.get(0,0) * mat4.get(0, 0) + this.get(0,1) * mat4.get(1,0) + this.get(0,2) * mat4.get(2,0) + this.get(0,3) * mat4.get(3,0);
        var val2 = this.get(0,0) * mat4.get(0, 1) + this.get(0,1) * mat4.get(1,1) + this.get(0,2) * mat4.get(2,1) + this.get(0,3) * mat4.get(3,1);
        var val3 = this.get(0,0) * mat4.get(0, 2) + this.get(0,1) * mat4.get(1,2) + this.get(0,2) * mat4.get(2,2) + this.get(0,3) * mat4.get(3,2);
        var val4 = this.get(0,0) * mat4.get(0, 3) + this.get(0,1) * mat4.get(1,3) + this.get(0,2) * mat4.get(2,3) + this.get(0,3) * mat4.get(3,3);

        var val5 = this.get(1,0) * mat4.get(0, 0) + this.get(1,1) * mat4.get(1,0) + this.get(1,2) * mat4.get(2,0) + this.get(1,3) * mat4.get(3,0);
        var val6 = this.get(1,0) * mat4.get(0, 1) + this.get(1,1) * mat4.get(1,1) + this.get(1,2) * mat4.get(2,1) + this.get(1,3) * mat4.get(3,1);
        var val7 = this.get(1,0) * mat4.get(0, 2) + this.get(1,1) * mat4.get(1,2) + this.get(1,2) * mat4.get(2,2) + this.get(1,3) * mat4.get(3,2);
        var val8 = this.get(1,0) * mat4.get(0, 3) + this.get(1,1) * mat4.get(1,3) + this.get(1,2) * mat4.get(2,3) + this.get(1,3) * mat4.get(3,3);

        var val9 = this.get(2,0) * mat4.get(0, 0) + this.get(2,1) * mat4.get(1,0) + this.get(2,2) * mat4.get(2,0) + this.get(2,3) * mat4.get(3,0);
        var val10 = this.get(2,0) * mat4.get(0, 1) + this.get(2,1) * mat4.get(1,1) + this.get(2,2) * mat4.get(2,1) + this.get(2,3) * mat4.get(3,1);
        var val11 = this.get(2,0) * mat4.get(0, 2) + this.get(2,1) * mat4.get(1,2) + this.get(2,2) * mat4.get(2,2) + this.get(2,3) * mat4.get(3,2);
        var val12 = this.get(2,0) * mat4.get(0, 3) + this.get(2,1) * mat4.get(1,3) + this.get(2,2) * mat4.get(2,3) + this.get(2,3) * mat4.get(3,3);
        
        var val13 = this.get(3,0) * mat4.get(0, 0) + this.get(3,1) * mat4.get(1,0) + this.get(3,2) * mat4.get(2,0) + this.get(3,3) * mat4.get(3,0);
        var val14 = this.get(3,0) * mat4.get(0, 1) + this.get(3,1) * mat4.get(1,1) + this.get(3,2) * mat4.get(2,1) + this.get(3,3) * mat4.get(3,1);
        var val15 = this.get(3,0) * mat4.get(0, 2) + this.get(3,1) * mat4.get(1,2) + this.get(3,2) * mat4.get(2,2) + this.get(3,3) * mat4.get(3,2);
        var val16 = this.get(3,0) * mat4.get(0, 3) + this.get(3,1) * mat4.get(1,3) + this.get(3,2) * mat4.get(2,3) + this.get(3,3) * mat4.get(3,3);


        
        multMat.set(0,0, val1);
        multMat.set(0,1, val2);
        multMat.set(0,2, val3);
        multMat.set(0,3, val4);
        multMat.set(1,0, val5);
        multMat.set(1,1, val6);
        multMat.set(1,2, val7);
        multMat.set(1,3, val8);
        multMat.set(2,0, val9);
        multMat.set(2,1, val10);
        multMat.set(2,2, val11);
        multMat.set(2,3, val12);
        multMat.set(3,0, val13);
        multMat.set(3,1, val14);
        multMat.set(3,2, val15);
        multMat.set(3,3, val16);
       
        return  multMat;
    }

    static rotateAroundAxis(a, v) {
        let s = Math.sin(a);
        let c = Math.cos(a);
        let d = 1 - c;
        let r = Matrix4.identity();
        r.set(0, 0, (d * v.x * v.x) + c);
        r.set(1, 0, (d * v.y * v.x) + (s * v.z));
        r.set(2, 0, (d * v.z * v.x) - (s * v.y));
        r.set(3, 0, 0);

        r.set(0, 1, (d * v.x * v.y) - (s*v.z));
        r.set(1, 1, (d * v.y * v.y) + c);
        r.set(2, 1, (d * v.z * v.y) + (s*v.x));
        r.set(3, 1, 0);
        
        r.set(0, 2, (d * v.x * v.z) + (s*v.y));
        r.set(1, 2, (d * v.y * v.z) - (s*v.x));
        r.set(2, 2, (d * v.z * v.z) + c);
        r.set(3, 2, 0);

        r.set(0, 3, 0);
        r.set(1, 3, 0);
        r.set(2, 3, 0);
        r.set(3, 3, 1);
        return r;
      }
    
    
}