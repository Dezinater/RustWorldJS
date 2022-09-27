import LZ4Reader from './LZ4Reader';
import { WorldData } from './proto/WorldData';
import TerrainMap from './rust/TerrainMap';
import LZ4Writer from './LZ4Writer';

(async () => {
    let buffer = await (await fetch("./SancMapNoPrefabs.map")).arrayBuffer();
    let rawBytes = new Uint8Array(buffer).slice(4, buffer.byteLength);

    let stream = new LZ4Reader(rawBytes);
    let decoded = WorldData.decode(stream.getOutput());
    console.log(decoded);
    drawMap(decoded);

    let encoded = WorldData.encode(decoded).finish();
    let writer = new LZ4Writer(encoded);
    downloadBlob(writer.currentOutput, "testMap.map", "application/octet-stream");
})();

function downloadBlob(data: Uint8Array, fileName: string, mimeType: string) {
    let blob, url: any;
    blob = new Blob([data], {
        type: mimeType
    });
    url = window.URL.createObjectURL(blob);
    downloadURL(url, fileName);
    setTimeout(function () {
        return window.URL.revokeObjectURL(url);
    }, 1000);
};

function downloadURL(data: any, fileName: string) {
    var a;
    a = document.createElement('a');
    a.href = data;
    a.download = fileName;
    document.body.appendChild(a);
    //a.style = 'display: none';
    a.click();
    a.remove();
};


function convertToImageData(ctx: any, data: any, res: number, color = [150, 150, 150], transparent = true) {
    let imageData = ctx?.createImageData(res, res) as ImageData;
    for (let i = 0; i < data.length; i++) {
        imageData.data[(i * 4)] = color[0] //* (1 / 255);
        imageData.data[(i * 4) + 1] = color[1] //* (1 / 255);
        imageData.data[(i * 4) + 2] = color[2] //* (1 / 255);
        if (transparent) {
            imageData.data[(i * 4) + 3] = data[i];
        } else {
            imageData.data[(i * 4) + 3] = 255;
        }
    }
    return imageData;
}

async function drawMap(decoded: WorldData) {
    let canvas = document.getElementById("mainCanvas") as HTMLCanvasElement;
    let ctx = canvas.getContext('2d');
    if (ctx == undefined) {
        console.error("CTX null");
        return;
    }
    /*
        let finalMap = new Uint8Array(writer.currentOutput.length + 4);
        finalMap[0] = 9;
        finalMap.set(writer.currentOutput, 4);
    */

    let terrainData = decoded.maps.find(x => x.name == "terrain");
    let heightData = decoded.maps.find(x => x.name == "terrain");
    let splatData = decoded.maps.find(x => x.name == "splat");
    let biomeData = decoded.maps.find(x => x.name == "biome");
    let waterData = decoded.maps.find(x => x.name == "water");
    if (terrainData == undefined || splatData == undefined || biomeData == undefined || waterData == undefined || heightData == undefined) {
        console.error("Missing map data");
        return;
    }

    let terrainMap = new TerrainMap(terrainData.data, 1, "short");
    let heightMap = new TerrainMap(heightData.data, 1, "short");
    let splatMap = new TerrainMap(splatData.data, 8, "byte");
    let biomeMap = new TerrainMap(biomeData.data, 4, "byte");
    let waterMap = new TerrainMap(waterData.data, 1, "short");

    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#12404d";
    ctx.fill();

    let currentMap = splatMap;
    let currentData = currentMap.getChannel(7); //gravel
    let imageData;

    currentMap = splatMap;
    let splatTypes = [
        [115, 118, 83], //dirt
        [255, 250, 250], //snow
        [194, 178, 128], //sand
        [90, 77, 65], //rock
        [126, 200, 80], //grass
        [132, 192, 17], //forest
        [136, 140, 141], //stones
        [75, 58, 43], //gravel
    ];

    for (let i = 7; i >= 0; i--) {
        //for (let i = 0; i < 8; i++) {
        currentData = currentMap.getChannel(i);
        imageData = await createImageBitmap(convertToImageData(ctx, currentData, currentMap.res, splatTypes[i]));
        ctx.drawImage(imageData, 0, 0, canvas.width, canvas.height);
    }

    let filteredTerrain = heightMap.dst.map(x => x *= 1 / 255).map(x => {
        if (x > 60 && x <= 63) {
            return 235 - (25 * (x - 60));
        }
        if (x > 63) {
            return 0;
        }

        return 255;
    });
    imageData = await createImageBitmap(convertToImageData(ctx, filteredTerrain, heightMap.res, [18, 64, 77], true));
    ctx.drawImage(imageData, 0, 0, canvas.width, canvas.height);


    ctx.fillStyle = "#ff0000";
    let count: { [key: string]: number } = {};

    decoded.prefabs.forEach(x => {
        if (x.category == "Monument") {
            if (!(x.id in count)) {
                count[x.id] = 0;
            }
            count[x.id]++;

            let xPos = decoded.size / 2 + x.position.x
            let yPos = decoded.size / 2 + x.position.z

            ctx?.beginPath();
            ctx?.arc(xPos, yPos, 35, 0, 2 * Math.PI);
            ctx?.fill();
        }
    });
}