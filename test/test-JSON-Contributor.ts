import test, { ExecutionContext } from "ava";
import * as path from "path";

import { Metadata } from "@models/metadata";
import { Contributor } from "@models/metadata-contributor";
import { IStringMap } from "@models/metadata-multilang";
import { setLcpNativePluginPath } from "@r2-lcp-rn/parser/epub/lcp";
import { JsonArray, TaJsonDeserialize, TaJsonSerialize } from "@r2-lcp-rn/serializable";

import { initGlobalConverters_GENERIC, initGlobalConverters_SHARED } from "../src/init-globals";
import {
    checkType, checkType_Array, checkType_Number, checkType_Object, checkType_String, inspect,
    logJSON,
} from "./helpers";

initGlobalConverters_SHARED();
initGlobalConverters_GENERIC();

setLcpNativePluginPath(path.join(process.cwd(), "LCP", "lcp.node"));

// ==========================

const contributor1NameStr = "theName1";
const contributor1Id = "theID1";
const contributor1Pos = 1;
const contributor1 = new Contributor();
contributor1.Name = contributor1NameStr;
contributor1.Identifier = contributor1Id;
contributor1.Position = contributor1Pos;
const contributor1RoleArr = ["theRole1-A", "theRole1-B"];
contributor1.Role = contributor1RoleArr;

const contributor2NameMapLang = "en";
const contributor2NameMapVal = "theName2";
const contributor2NameMap = {} as IStringMap;
contributor2NameMap[contributor2NameMapLang] = contributor2NameMapVal;
const contributor2NameObj = { name: contributor2NameMap };
const contributor2Id = "theID2";
const contributor2 = new Contributor();
contributor2.Name = contributor2NameMap;
contributor2.Identifier = contributor2Id;
const contributor2RoleStr = "theRole2";
contributor2.Role = [contributor2RoleStr];

const checkContributor1Name = (t: ExecutionContext, obj: string | IStringMap) => {

    checkType_String(t, obj);
    t.is(obj, contributor1NameStr);
};

const checkContributor2Name = (t: ExecutionContext, obj: string | IStringMap) => {

    checkType_Object(t, obj);
    checkType_String(t, (obj as IStringMap)[contributor2NameMapLang]);
    t.is((obj as IStringMap)[contributor2NameMapLang], contributor2NameMapVal);
};

const checkJsonContributor1 = (t: ExecutionContext, obj: any) => {

    checkType_Object(t, obj);

    checkContributor1Name(t, obj.name);

    checkType_String(t, obj.identifier);
    t.is(obj.identifier, contributor1Id);

    checkType_Number(t, obj.position);
    t.is(obj.position, contributor1Pos);

    checkType_Array(t, obj.role);
    t.is(obj.role.length, contributor1RoleArr.length);
    t.is(obj.role[0], contributor1RoleArr[0]);
    t.is(obj.role[1], contributor1RoleArr[1]);
};

const checkJsonContributor2 = (t: ExecutionContext, obj: any) => {

    checkType_Object(t, obj);

    checkContributor2Name(t, obj.name);

    checkType_String(t, obj.identifier);
    t.is(obj.identifier, contributor2Id);

    checkType_String(t, obj.role);
    t.is(obj.role, contributor2RoleStr);
};

const checkObjContributor1 = (t: ExecutionContext, obj: Contributor) => {

    checkType(t, obj, Contributor);

    checkContributor1Name(t, obj.Name);

    checkType_String(t, obj.Identifier);
    t.is(obj.Identifier, contributor1Id);

    checkType_Number(t, obj.Position);
    t.is(obj.Position, contributor1Pos);

    checkType_Array(t, obj.Role);
    t.is(obj.Role.length, 2);
    t.is(obj.Role[0], contributor1RoleArr[0]);
    t.is(obj.Role[1], contributor1RoleArr[1]);
};

const checkObjContributor2 = (t: ExecutionContext, obj: Contributor) => {

    checkType(t, obj, Contributor);

    checkContributor2Name(t, obj.Name);

    checkType_String(t, obj.Identifier);
    t.is(obj.Identifier, contributor2Id);

    checkType_Array(t, obj.Role);
    t.is(obj.Role.length, 1);
    t.is(obj.Role[0], contributor2RoleStr);
};

// ==========================

test("JSON SERIALIZE: Metadata.Imprint => Contributor[]", (t) => {

    const b = new Metadata();
    b.Imprint = [];
    b.Imprint.push(contributor1);
    b.Imprint.push(contributor2);
    inspect(b);

    const json = TaJsonSerialize(b);
    logJSON(json);

    checkType_Array(t, json.imprint);
    const arr = json.imprint as JsonArray;
    t.is(arr.length, 2);

    checkJsonContributor1(t, arr[0]);
    checkJsonContributor2(t, arr[1]);
});

test("JSON SERIALIZE: Metadata.Imprint => Contributor[1] collapse-array", (t) => {

    const b = new Metadata();
    b.Imprint = [contributor1];
    inspect(b);

    const json = TaJsonSerialize(b);
    // // (normalizes single-item array to the item value itself)
    // traverseJsonObjects(json,
    //     (obj, parent, keyInParent) => {
    //         if (parent && obj instanceof Array && obj.length === 1) {
    //             parent[keyInParent] = obj[0];
    //         }
    //     });
    logJSON(json);

    checkJsonContributor1(t, json.imprint);
});

test("JSON DESERIALIZE: Metadata.Imprint => Contributor[]", (t) => {

    const json: any = {};
    json.imprint = [
        { name: contributor1NameStr, identifier: contributor1Id, position: contributor1Pos, role: contributor1RoleArr },
        { name: contributor2NameMap, identifier: contributor2Id, role: contributor2RoleStr },
    ];
    logJSON(json);

    const b: Metadata = TaJsonDeserialize<Metadata>(json, Metadata);
    inspect(b);

    checkType_Array(t, b.Imprint);
    t.is(b.Imprint.length, 2);

    checkObjContributor1(t, b.Imprint[0]);
    checkObjContributor2(t, b.Imprint[1]);
});

test("JSON DESERIALIZE: Metadata.Imprint => Contributor[1]", (t) => {

    const json: any = {};
    json.imprint = [
        { name: contributor1NameStr, identifier: contributor1Id, position: contributor1Pos, role: contributor1RoleArr },
    ];
    logJSON(json);

    const b: Metadata = TaJsonDeserialize<Metadata>(json, Metadata);
    inspect(b);

    checkType_Array(t, b.Imprint);
    t.is(b.Imprint.length, 1);

    checkObjContributor1(t, b.Imprint[0]);
});

test("JSON DESERIALIZE: Metadata.Imprint => Contributor", (t) => {

    const json: any = {};
    // tslint:disable-next-line:max-line-length
    json.imprint = { name: contributor1NameStr, identifier: contributor1Id, position: contributor1Pos, role: contributor1RoleArr };
    logJSON(json);

    const b: Metadata = TaJsonDeserialize<Metadata>(json, Metadata);
    inspect(b);

    checkType_Array(t, b.Imprint);
    t.is(b.Imprint.length, 1);

    checkObjContributor1(t, b.Imprint[0]);
});

test("JSON DESERIALIZE: Metadata.Imprint => Contributor NAME []", (t) => {

    const json: any = {};
    json.imprint = [contributor1NameStr, contributor2NameObj];
    logJSON(json);

    const b: Metadata = TaJsonDeserialize<Metadata>(json, Metadata);
    inspect(b);

    checkType_Array(t, b.Imprint);
    t.is(b.Imprint.length, 2);

    checkType(t, b.Imprint[0], Contributor);
    checkContributor1Name(t, b.Imprint[0].Name);

    checkType(t, b.Imprint[1], Contributor);
    checkContributor2Name(t, b.Imprint[1].Name);
});

test("JSON DESERIALIZE: Metadata.Imprint => Contributor NAME [1] A", (t) => {

    const json: any = {};
    json.imprint = [contributor1NameStr];
    logJSON(json);

    const b: Metadata = TaJsonDeserialize<Metadata>(json, Metadata);
    inspect(b);

    checkType_Array(t, b.Imprint);
    t.is(b.Imprint.length, 1);

    checkType(t, b.Imprint[0], Contributor);
    checkContributor1Name(t, b.Imprint[0].Name);
});

test("JSON DESERIALIZE: Metadata.Imprint => Contributor NAME [1] B", (t) => {

    const json: any = {};
    json.imprint = [contributor2NameObj];
    logJSON(json);

    const b: Metadata = TaJsonDeserialize<Metadata>(json, Metadata);
    inspect(b);

    checkType_Array(t, b.Imprint);
    t.is(b.Imprint.length, 1);

    checkType(t, b.Imprint[0], Contributor);
    checkContributor2Name(t, b.Imprint[0].Name);
});

test("JSON DESERIALIZE: Metadata.Imprint => Contributor NAME A", (t) => {

    const json: any = {};
    json.imprint = contributor1NameStr;
    logJSON(json);

    const b: Metadata = TaJsonDeserialize<Metadata>(json, Metadata);
    inspect(b);

    checkType_Array(t, b.Imprint);
    t.is(b.Imprint.length, 1);

    checkType(t, b.Imprint[0], Contributor);
    checkContributor1Name(t, b.Imprint[0].Name);
});

test("JSON DESERIALIZE: Metadata.Imprint => Contributor NAME B", (t) => {

    const json: any = {};
    json.imprint = contributor2NameObj;
    logJSON(json);

    const b: Metadata = TaJsonDeserialize<Metadata>(json, Metadata);
    inspect(b);

    checkType_Array(t, b.Imprint);
    t.is(b.Imprint.length, 1);

    checkType(t, b.Imprint[0], Contributor);
    checkContributor2Name(t, b.Imprint[0].Name);
});
