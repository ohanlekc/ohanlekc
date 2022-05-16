export class Vector4 {
  constructor(x, y, z, w) {
    this.coordinates = [x, y, z, w];
  }

  
  get x() {
    return this.coordinates[0];
  }

  get y() {
    return this.coordinates[1];
  }

  get z() {
    return this.coordinates[2];
  }

  get w() {
    return this.coordinates[3];
  }

  set x(value) {
    this.coordinates[0] = value;
  }

  set y(value) {
    this.coordinates[1] = value;
  }

  set z(value) {
    this.coordinates[2] = value;
  }

  set w(value) {
    this.coordinates[3] = value;
  }

  get magnitude() {
    return Math.sqrt(
      this.coordinates[0] * this.coordinates[0] +
      this.coordinates[1] * this.coordinates[1] +
      this.coordinates[2] * this.coordinates[2] +
      this.coordinates[3] * this.coordinates[3]
    );
  }
  normalize() {
    return new Vector4(this.coordinates[0] / this.magnitude, this.coordinates[1] / this.magnitude, this.coordinates[2] / this.magnitude, this.coordinates[3] / this.magnitude);
  }
  toString() {
    return `[${this.coordinates[0]}, ${this.coordinates[1]}, ${this.coordinates[2]}, ${this.coordinates[3]}]`;
  }

  subtract(vector) {
    return new Vector4(this.coordinates[0] - vector.x, this.coordinates[1] - vector.y, this.coordinates[2] - vector.z, this.coordinates[3] - vector.w);
  }

  add(vector) {
    return new Vector3(this.coordinates[0] + vector.x, this.coordinates[1] + vector.y, this.coordinates[2] + vector.z, this.coordinates[3] + vector.w);
  }

  scalarMult(scalar) {
    return new Vector3(this.coordinates[0] * scalar, this.coordinates[1] * scalar, this.coordinates[2] * scalar, this.coordinates[3] * scalar);
  }

}

export class Vector3 {
  constructor(x, y, z) {
    this.coordinates = [x, y, z];
  }

  get x() {
    return this.coordinates[0];
  }

  get y() {
    return this.coordinates[1];
  }


  get z() {
    return this.coordinates[2];
  }

  set x(value) {
    this.coordinates[0] = value;
  }

  set y(value) {
    this.coordinates[1] = value;
  }

  set z(value) {
    this.coordinates[2] = value;
  }

  get magnitude() {
    return Math.sqrt(
      this.coordinates[0] * this.coordinates[0] +
      this.coordinates[1] * this.coordinates[1] +
      this.coordinates[2] * this.coordinates[2]
    );
  }

  normalize() {
    return new Vector3(this.coordinates[0] / this.magnitude, this.coordinates[1] / this.magnitude, this.coordinates[2] / this.magnitude);
  }

  toString() {
    return `[${this.coordinates[0]}, ${this.coordinates[1]}, ${this.coordinates[2]}]`;
  }

  subtract(vector) {
    return new Vector3(this.coordinates[0] - vector.x, this.coordinates[1] - vector.y, this.coordinates[2] - vector.z);
  }

  add(vector) {
    return new Vector3(this.coordinates[0] + vector.x, this.coordinates[1] + vector.y, this.coordinates[2] + vector.z);
  }

  scalarMult(scalar) {
    return new Vector3(this.coordinates[0] * scalar, this.coordinates[1] * scalar, this.coordinates[2] * scalar);
  }

  cross(vector) {
    // console.log("This is coords at 0,1,2", this.coordinates[0], this.coordinates[1], this.coordinates[2]);
    // console.log("This is vector x,y,z", vector.x, vector.y, vector.z);
    // console.log("first part of first cross", this.coordinates[2] * vector.y);
    // console.log("Cross X", this.coordinates[1] * vector.z - this.coordinates[2] * vector.y);
    // console.log("Cross Y", this.coordinates[2] * vector.x - this.coordinates[0] * vector.z);
    // console.log("Cross Z", this.coordinates[0] * vector.y - this.coordinates[1] * vector.x);
    return new Vector3(this.coordinates[1] * vector.z - this.coordinates[2] * vector.y, this.coordinates[2] * vector.x - this.coordinates[0] * vector.z, this.coordinates[0] * vector.y - this.coordinates[1] * vector.x);
  }


}
