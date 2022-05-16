
import {Trimesh} from './trimesh';

export class Terrain {

    constructor(elevations, width, depth) {
        this.elevations = [];
        this.width = width;
        this.depth = depth;
        elevations.forEach(e => this.elevations.push(e));
    }

    // height getter
    get(x, z)
    {
        return this.elevations[z * this.width + x];
    }

    // height setter
    set(x, z, elevation)
    {
        this.elevations[z * this.width + x] = elevation;
    }

    // to tri mesh
    toTrimesh()
    {
        let positions = [];

        for (let z = 0; z < this.depth; z ++) //z in 0..depth
        {
            for (let x = 0; x < this.width; x ++)//in 0..width
            {
                let y = this.get(x, z);
                positions.push(x, y, z);
            }
        }

        let faces = [];

        for (let z = 0; z < this.depth - 1; z ++) // to depth - 1
        {
            let nextZ = z + 1;
            for (let x = 0; x < this.width - 1; x ++) // to width - 1
            {
                let nextX = x + 1;
                faces.push([
                    z * this.width + x,
                    z * this.width + nextX,
                    nextZ * this.width + x
                ]);
                faces.push([
                    z * this.width + nextX,
                    nextZ * this.width + nextX,
                    nextZ * this.width + x
                ]);
            }
        }
        console.log("pos", positions );
        console.log("face", faces );

        return new Trimesh(positions, faces);
    }

    blerp(x, z) {
        var floorX = Math.floor(x);
        var floorZ = Math.floor(z);
    
        var fractionX = x - floorX;
        var fractionZ = z - floorZ;
  
        var nearLeft = this.get(floorX, floorZ);
        var nearRight = this.get(floorX + 1, floorZ);
        var nearMix = this.lerp(fractionX, nearLeft, nearRight);

        var farLeft = this.get(floorX, floorZ + 1);
        var farRight = this.get(floorX + 1, floorZ + 1);
        var farMix = this.lerp(fractionX, farLeft, farRight);

        return this.lerp(fractionZ, nearMix, farMix)
    }

    //Check order of parameters
    lerp(t, start, end) {
        return start + t * (end - start);
    }
}