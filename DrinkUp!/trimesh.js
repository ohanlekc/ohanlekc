import { Vector3 } from './vector';

export class Trimesh {

    constructor(positions = [], indices = [], normals = []) {
        this.positions = positions;
        this.normals = normals;
        this.indices = indices;
    }

    getPositions() {
        return this.positions.flatMap(vector => vector.coordinates);
    }

    getNormals() {
        return this.normals.flatMap(vector => vector.coordinates);
    }

    getIndices() {
        return this.indices;
    }

    setPositions(newPos) { this.positions = newPos; }
    setNormals(newNorms) { this.normals = newNorms; }
    setIndices(newInd) { this.indices = newInd; }

    generateNormals(/*tempPositions,*/ positions, indices) {

        // tempPositions.forEach(position => {
        //     positions.push(new Vector3(Number(position.x), Number(position.y), Number(position.z)));
        // });

        let vertexNormal = [];
        //console.log("pos len", positions.length);
        //console.log("are they the same?", positions.length);
        // Set vertex normals to 0 vectors
        for (let i = 0; i < positions.length / 3; i++) {
            vertexNormal[i] = new Vector3(0, 0, 0);
        }
        console.log("pos len", vertexNormal.length);
        // For each triangle
        console.log("indices", indices.length);
        for (let i = 0; i < indices.length; i++) {
            // The three verts that make up this tri
            //let triangle = new Vecr3(positions[indices[i][0]], positions[indices[i][1]], positions[indices[i][2]]);
            //console.log("triangle", triangle);

            let positionA = new Vector3(positions[indices[i][0] * 3], positions[indices[i][0]* 3 + 1], positions[indices[i][0]*3 + 2]);
            let positionB = new Vector3(positions[indices[i][1] * 3], positions[indices[i][1]* 3 + 1], positions[indices[i][1]*3 + 2]);
            let positionC = new Vector3(positions[indices[i][2] * 3], positions[indices[i][2] * 3 + 1], positions[indices[i][2]* 3 + 2]);
            //console.log("Positon A, B, C", positionA, positionB, positionC);
            // Find two edge vectors
            let vectorAB = positionB.subtract(positionA);
            let vectorAC = positionC.subtract(positionA);
            //console.log("vectorAB", vectorAB);

            //console.log("vectorAC", vectorAC);
            // Calculate face normal
            let faceNormal = vectorAC.cross(vectorAB);
            //console.log("faceNormal", faceNormal);
            faceNormal = faceNormal.normalize();
            //console.log("FN", faceNormal);

            // For each vertex in triangle, add faceNormal to vertexNormal
            // console.log("faceNormal", faceNormal);
            
            
            vertexNormal[indices[i][0]] = vertexNormal[indices[i][0]].add(faceNormal);
            vertexNormal[indices[i][1]] = vertexNormal[indices[i][1]].add(faceNormal);
            vertexNormal[indices[i][2]] = vertexNormal[indices[i][2]].add(faceNormal);

            //console.log("VN",vertexNormal[i]);
        }
        
        //Average added face normals
        vertexNormal.forEach(normal => {
           normal = normal.normalize();
        });

        return vertexNormal;
    }

    static fromObj(fetchedData) {

        let tempPositions = [];
        let tempIndices = [];
        let tempNormals = [];
        let hasNormals = false;

        const lineArray = fetchedData.split("\n");

        lineArray.forEach(line => {

            // Ignore blank lines
            if (line.length == 0) return;

            const tokenizedLine = line.split(/\s+/);

            let token = tokenizedLine[0];

            if (token == "v") {
                tempPositions.push(new Vector3(tokenizedLine[1], tokenizedLine[2],
                    tokenizedLine[3]));
            }

            if (token == "f") {
                // Remove invalid token at end of line, if extant
                if (tokenizedLine[tokenizedLine.length - 1] == "") tokenizedLine.pop();

                for (let i = 2; i <= tokenizedLine.length - 2; i += 2) {
                    tempIndices.push(new Vector3(tokenizedLine[1], tokenizedLine[i], tokenizedLine[i + 1]));
                }
            }

            if (token == "vn") {
                tempNormals.push(new Vector3(tokenizedLine[1],
                    tokenizedLine[2], tokenizedLine[3]));
                hasNormals = true;
            }
        });

        let indices = [];
        let positions = [];
        let normals = [];

        let slashTokenToIndex = new Map();

        tempIndices.forEach(triangle => {

            // Split line into individual tokens
            const slashTokens = triangle.coordinates;

            slashTokens.forEach(slashToken => {

                // If the token combo hasn't been seen
                // add it to the map and create a new vertex
                if (hasNormals) {
                    if (slashTokenToIndex.get(slashToken) == null) {
                        slashTokenToIndex.set(slashToken, positions.length);

                        // Split token into two numbers
                        const splitToken = slashToken.split('//');

                        // Correct for 1-based indexing in .obj
                        const positionIndex = Number(splitToken[0] - 1);
                        const normIndex = Number(splitToken[1] - 1);
                        positions.push(new Vector3(Number(tempPositions[positionIndex].x), Number(tempPositions[positionIndex].y), Number(tempPositions[positionIndex].z)));
                        normals.push(new Vector3(Number(tempNormals[normIndex].x), Number(tempNormals[normIndex].y), Number(tempNormals[normIndex].z)));
                    }

                    const index = slashTokenToIndex.get(slashToken);
                    indices.push(index);

                } else {
                    slashToken--;
                    indices.push(slashToken);
                }
            });

        });

        if (!hasNormals) {

            normals = this.generateNormals(tempPositions, positions, indices);
        }

        let mesh = new Trimesh(positions, normals, indices);
        return mesh;

    }
}