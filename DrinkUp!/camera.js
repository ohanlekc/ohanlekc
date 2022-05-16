import {Matrix4} from './matrix';
import { Vector3 } from './vector';
import { Vector4 } from './vector'; 


export class Camera {
    constructor(position, lookAt, worldUp) {
        this.position = position;
        this.lookAt = lookAt;
        this.worldUp = worldUp;
        this.eyeFromWorld = Matrix4.translate(0, 0, -10);;
        this.forward = this.lookAt.subtract(this.position).normalize();// computed from lookAt and position
        this.right;
        this.up;
        this.reorient();
    }

    reorient() {
        this.right = this.forward.cross(this.worldUp);
        this.up = this.right.cross(this.forward);
        let rotator = Matrix4.identity();
        rotator.set(0, 0, this.right.x);
        rotator.set(0, 1, this.right.y);
        rotator.set(0, 2, this.right.z);

        rotator.set(1, 0, this.up.x);
        rotator.set(1, 1, this.up.y);
        rotator.set(1,  2, this.up.z);

        rotator.set(2, 0, -this.forward.x);
        rotator.set(2, 1, -this.forward.y);
        rotator.set(2, 2, -this.forward.z);
    
        let translater = Matrix4.translate(-this.position.x, -this.position.y, -this.position.z);
        this.eyeFromWorld = rotator.multiplyMatrix(translater);
    }
    strafe(distance) {
        this.position = this.position.add(this.right.scalarMult(distance));
        this.reorient();
    }
    advance(distance) {
      this.position = this.position.add(this.forward.scalarMult(distance));
      this.reorient();
    }
    yaw(degrees) {
        let forVec = new Vector4(this.forward.x, this.forward.y, this.forward.z, 1);
        let temp = Matrix4.rotateAroundAxis(degrees, this.worldUp).multiplyVector(forVec);//.multiplyVector(forwardVec);
        this.forward = new Vector3(temp.x, temp.y, temp.z);
        this.reorient();
    }
    pitch(degrees) {
        let forVec = new Vector4(this.forward.x, this.forward.y, this.forward.z, 1);
        let temp = Matrix4.rotateAroundAxis(degrees, this.right).multiplyVector(forVec);
        this.forward = new Vector3(temp.x,temp.y ,temp.z);
        this.reorient();
    }

}