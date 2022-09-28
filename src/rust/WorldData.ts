import { Message, Type, Field, OneOf } from "protobufjs/light"; // respectively "./node_modules/protobufjs/light.js"
import TerrainMap from "./TerrainMap";

const TERRAIN_MAPS  = {
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
        dataType: "short",
        channels: 4
    },
    "alpha": {
        dataType: "byte",
        channels: 1
    },
};

export class VectorData extends Message<VectorData> {
    @Field.d(1, "float", "required", 0)
    public x: number;

    @Field.d(2, "float", "required", 0)
    public y: number;

    @Field.d(3, "float", "required", 0)
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
    @Field.d(1, "string", "required", "")
    public category: string;

    @Field.d(2, "uint32", "required", 0)
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
    getTerrainMap(mapName: string, channels: number = undefined, dataType: string | "byte" | "short" | "int" = undefined): TerrainMap {
        if (this.maps == undefined) {
            return undefined;
        }

        let mapData = this.maps.find(x => x.name == mapName);
        let map;
        
        if (channels != undefined && dataType != undefined) {
            map = new TerrainMap(mapData.data, channels, dataType);
        } else {
            if (mapName in TERRAIN_MAPS) {
                let mapInfo = TERRAIN_MAPS[mapName as keyof typeof TERRAIN_MAPS];
                map = new TerrainMap(mapData.data, mapInfo.channels, mapInfo.dataType);
            }
        }

        return map;
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

