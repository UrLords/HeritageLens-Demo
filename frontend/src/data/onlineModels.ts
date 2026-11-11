import object01 from "../../../data/objects/object-01/object.json";
import object02 from "../../../data/objects/object-02/object.json";

export const onlineModelCredits = [object01, object02];

const onlineModels = import.meta.glob<string>(
  ["../../online-models/object-01.glb", "../../online-models/object-02.glb"],
  { eager: true, query: "?url", import: "default" }
);

export function getOnlineModelUrl(objectId: string): string | undefined {
  return onlineModels[`../../online-models/${objectId}.glb`];
}
