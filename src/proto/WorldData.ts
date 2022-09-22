import { Message, Type, Field, OneOf } from "protobufjs/light"; // respectively "./node_modules/protobufjs/light.js"

export class VectorData extends Message<VectorData> {
    @Field.d(1, "float", "required", 0)
    public x: number;

    @Field.d(2, "float", "required", 0)
    public y: number;

    @Field.d(3, "float", "required", 0)
    public z: number;
}

export class PathData extends Message<PathData> {
    @Field.d(1, "string", "required", "")
    public name: string;

    @Field.d(2, "bool", "required", false)
    public spline: boolean;

    @Field.d(3, "bool", "required", false)
    public start: boolean;

    @Field.d(4, "bool", "required", false)
    public end: boolean;

    @Field.d(5, "float", "required", false)
    public width: number;

    @Field.d(6, "float", "required", false)
    public innerPadding: number;

    @Field.d(7, "float", "required", false)
    public outerPadding: number;

    @Field.d(8, "float", "required", false)
    public innerFade: number;

    @Field.d(9, "float", "required", false)
    public outerFade: number;

    @Field.d(10, "float", "required", false)
    public randomScale: number;

    @Field.d(11, "float", "required", false)
    public meshOffset: number;

    @Field.d(12, "float", "required", false)
    public terrainOffset: number;

    @Field.d(13, "int32", "required", false)
    public splat: number;

    @Field.d(14, "int32", "required", false)
    public topology: number;

    @Field.d(15, VectorData)
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
    @Field.d(1, "uint32", "required", 2000)
    public size: number;

    @Field.d(2, MapData, "repeated")
    public maps: MapData[];

    @Field.d(3, PrefabData, "repeated")
    public prefabs: PrefabData[];

    @Field.d(4, PathData, "repeated")
    public paths: PathData[];
}

