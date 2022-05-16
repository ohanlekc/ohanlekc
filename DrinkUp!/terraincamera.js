import { Camera } from './camera';
import { Terrain } from './terrain';
export class TerrainCamera extends Camera {
    constructor(position, lookAt, worldUp, terrain, eyeLevel) {
        super(position, lookAt, worldUp);
        this.terrain = terrain;
        this.eyeLevel = eyeLevel;
        this.buoy();
        this.reorient();
    }

  buoy() {
    // clamp from.x and from.z to valid terrain coordinates
    // if (position)
    // position.x = terrain.x;

    //   //    // from.y = interpolated height (blerp) + eye level
    if(this.position.x > this.terrain.x) {
        this.position.x = this.terrain.x;
    }
    if(this.position.z > this.terrain.z) {
        this.position.z = this.terrain.z;
    }
    this.position.y = this.terrain.blerp(this.position.x, this.position.z) + this.eyeLevel;
  }

  advance(delta) {
    //   //   //calculate new from
    //   //   //buoy
    //   //   //reorient
    this.position = this.position.add(this.forward.scalarMult(delta));
    this.buoy();
    this.reorient();
  }
    

  strafe(delta) {
    //   //   //calculate new from
    //   //   //buoy
    //   //   //reorient
    this.position = this.position.add(this.right.scalarMult(delta));
    this.buoy();
    this.reorient();
  }

  clamp(num, min, max) {
      return Math.min(Math.max(num,min), max);
  }

}