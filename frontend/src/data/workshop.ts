import object01 from "../../../data/objects/object-01/object.json";
import object02 from "../../../data/objects/object-02/object.json";
import object03 from "../../../data/objects/object-03/object.json";
import object04 from "../../../data/objects/object-04/object.json";
import object05 from "../../../data/objects/object-05/object.json";
import type { Metadata } from "../types/heritage";

export const workshopObjects: Metadata[] = [object01, object02, object03, object04, object05];

export const workshopModels = import.meta.glob<string>(
  ["../../workshop-models/object-01.glb", "../../workshop-models/object-02.glb"],
  { eager: true, query: "?url", import: "default" }
);
