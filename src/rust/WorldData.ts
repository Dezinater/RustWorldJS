import pkg from 'protobufjs/light.js';
const { Message, Field } = pkg;

import TerrainMap from "./TerrainMap.js";
import TextMap from "./TextMap.js";

export { Message, Field };

const TERRAIN_MAPS = {
    "terrain": {
        dataType: "short",
        channels: 1
    },
    "height": {
        dataType: "short",
        channels: 1
    },
    "water": {
        dataType: "short",
        channels: 1
    },
    "splat": {
        dataType: "byte",
        channels: 8
    },
    "topology": {
        dataType: "int",
        channels: 1
    },
    "biome": {
        dataType: "byte",
        channels: 4
    },
    "alpha": {
        dataType: "byte",
        channels: 1
    },
};

export class VectorData extends Message<VectorData> {
    @Field.d(1, "float")
    public x: number;

    @Field.d(2, "float")
    public y: number;

    @Field.d(3, "float")
    public z: number;
}

export class PathData extends Message<PathData> {
    @Field.d(1, "string", "optional")
    public name: string;

    @Field.d(2, "bool", "optional")
    public spline: boolean;

    @Field.d(3, "bool", "optional")
    public start: boolean;

    @Field.d(4, "bool", "optional")
    public end: boolean;

    @Field.d(5, "float", "optional")
    public width: number;

    @Field.d(6, "float", "optional")
    public innerPadding: number;

    @Field.d(7, "float", "optional")
    public outerPadding: number;

    @Field.d(8, "float", "optional")
    public innerFade: number;

    @Field.d(9, "float", "optional")
    public outerFade: number;

    @Field.d(10, "float", "optional")
    public randomScale: number;

    @Field.d(11, "float", "optional")
    public meshOffset: number;

    @Field.d(12, "float", "optional")
    public terrainOffset: number;

    @Field.d(13, "int32", "optional")
    public splat: number;

    @Field.d(14, "int32", "optional")
    public topology: number;

    @Field.d(15, VectorData, "repeated")
    public nodes: VectorData[];
}

export class PrefabData extends Message<PrefabData>  {
    @Field.d(1, "string")
    public category: string;

    @Field.d(2, "uint32")
    public id: number;

    @Field.d(3, VectorData)
    public position: VectorData;
    public rotation: VectorData;
    public scale: VectorData;
}

export class MapData extends Message<MapData> {
    @Field.d(1, "string", "required", "")
    public name: string;

    @Field.d(2, "bytes", "required")
    public data: Uint8Array;
}

export class WorldData extends Message<WorldData> {
    constructor(size) {
        super();
        this.size = size;
        this.maps = new Array<MapData>();
        this.prefabs = new Array<PrefabData>();
        this.paths = new Array<PathData>();
    }

    addMap(mapName: string, map: TerrainMap | TextMap) {
        let newMap = new MapData();
        newMap.name = mapName;
        newMap.data = map.getDst();

        this.maps.push(newMap)
    }

    setMap(mapName: string, map: TerrainMap | TextMap) {
        let findMap = this.maps.find(x => x.name == mapName);
        if (findMap != undefined) {
            findMap.data = map.getDst();
        } else {
            this.addMap(mapName, map);
        }
    }

    getMapAsTerrain(map: string | number, channels: number = undefined, dataType: string | "byte" | "short" | "int" = undefined): TerrainMap {
        if (this.maps == undefined) {
            return undefined;
        }

        let mapData: MapData;
        let terrainMap: TerrainMap;

        if (typeof map == "number") {
            mapData = this.maps[map as number]
        } else if (typeof map == "string") {
            mapData = this.maps.find(x => x.name == map);
        }

        if (channels != undefined && dataType != undefined) {
            terrainMap = new TerrainMap(mapData.data, channels, dataType, this.size);
        } else {
            if (map in TERRAIN_MAPS) {
                let mapInfo = TERRAIN_MAPS[map as keyof typeof TERRAIN_MAPS];
                terrainMap = new TerrainMap(mapData.data, mapInfo.channels, mapInfo.dataType, this.size);
            }
        }

        return terrainMap;
    }

    createEmptyTerrainMap(map: string, res: number) {
        if (res == undefined) {
            if (["terrain", "height", "water"].includes(map)) {
                if (this.size < 3072) {
                    res = 2049;
                } else {
                    res = 4097;
                }
            } else { //all other maps
                if (this.size <= 2048) {
                    res = 1024;
                } else if (this.size < 8192) {
                    res = 2048;
                }
            }
        }

        let mapInfo = TERRAIN_MAPS[map as keyof typeof TERRAIN_MAPS];
        if (mapInfo != undefined) {
            let size = res * res * mapInfo.channels;
            if (mapInfo.dataType == "short") {
                size *= 2;
            } else if (mapInfo.dataType == "int") {
                size *= 4;
            }

            return new TerrainMap(new Uint8Array(new ArrayBuffer(size)), mapInfo.channels, mapInfo.dataType, this.size)
        }
    }

    getMapAsText(map: string | number) {
        if (this.maps == undefined) {
            return undefined;
        }

        let mapData: MapData;

        if (typeof map == "number") {
            mapData = this.maps[map as number]
        } else if (typeof map == "string") {
            mapData = this.maps.find(x => x.name == map);
        }

        if (mapData != undefined) {
            return new TextMap(mapData.data);
        }
    }

    @Field.d(1, "uint32", "required", 2000)
    public size: number;

    @Field.d(2, MapData, "repeated")
    public maps: MapData[];

    @Field.d(3, PrefabData, "repeated")
    public prefabs: PrefabData[];

    @Field.d(4, PathData, "repeated")
    public paths: PathData[];
}

